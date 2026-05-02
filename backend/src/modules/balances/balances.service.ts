import { BadRequestException, Injectable } from '@nestjs/common';
import { CashAccountType, CurrencyCode, Prisma, TransactionType } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RatesService } from '../rates/rates.service';
import { BalancesRepository } from './balances.repository';

type MoneyPair = {
  uzs: Prisma.Decimal;
  usd: Prisma.Decimal;
};

@Injectable()
export class BalancesService {
  constructor(
    private readonly balancesRepository: BalancesRepository,
    private readonly ratesService: RatesService,
    private readonly prisma: PrismaService,
  ) {}

  async findAll() {
    const [accounts, grouped] = await Promise.all([
      this.balancesRepository.activeAccounts(),
      this.balancesRepository.groupedTransactionSums(),
    ]);

    return accounts.map((account) => {
      const sums = grouped.find((row) => row.cashAccountId === account.id);
      return {
        account,
        balanceUzs: sums?._sum.signedTotalUzs ?? 0,
        balanceUsd: sums?._sum.signedTotalUsd ?? 0,
      };
    });
  }

  async incomeVsExpense() {
    return this.balancesRepository.incomeVsExpense();
  }

  async byPoint() {
    return this.report();
  }

  async report(from?: string, to?: string, accountType?: CashAccountType) {
    const fromDate = from ? this.normalizeDate(from) : undefined;
    const toDate = to ? this.normalizeDate(to) : undefined;
    const reportRateDate = toDate ?? new Date();
    const reportRate = await this.ratesService.getRateByDate(CurrencyCode.USD, reportRateDate);

    if (!reportRate || reportRate.lte(0)) {
      throw new BadRequestException('Курс валюты на дату отчета не найден');
    }

    const accounts = await this.prisma.cashAccount.findMany({
      where: { isActive: true, type: accountType, deletedAt: null },
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
    });

    const periodDateFilter = {
      gte: fromDate,
      lte: toDate,
    };

    return Promise.all(
      accounts.map(async (account) => {
        const opening = await this.calculateOpening(account.id, fromDate, toDate ?? reportRateDate);
        const [income, expense, exchangeIn, exchangeOut] = await Promise.all([
          this.prisma.transaction.aggregate({
            where: { cashAccountId: account.id, type: TransactionType.INCOME, date: periodDateFilter, deletedAt: null },
            _sum: { totalUzs: true, totalUsd: true },
          }),
          this.prisma.transaction.aggregate({
            where: { cashAccountId: account.id, type: TransactionType.EXPENSE, date: periodDateFilter, deletedAt: null },
            _sum: { totalUzs: true, totalUsd: true },
          }),
          this.prisma.exchangeTransaction.findMany({
            where: { toAccountId: account.id, date: periodDateFilter, deletedAt: null },
          }),
          this.prisma.exchangeTransaction.findMany({
            where: { fromAccountId: account.id, date: periodDateFilter, deletedAt: null },
          }),
        ]);

        const openingBalanceUzs = opening.uzs;
        const openingBalanceUsd = opening.usd;
        const incomeUzs = new Prisma.Decimal(income._sum.totalUzs ?? 0);
        const incomeUsd = new Prisma.Decimal(income._sum.totalUsd ?? 0);
        const expenseUzs = new Prisma.Decimal(expense._sum.totalUzs ?? 0);
        const expenseUsd = new Prisma.Decimal(expense._sum.totalUsd ?? 0);
        const exchangeInAmounts = this.sumExchangeIn(exchangeIn);
        const exchangeOutAmounts = this.sumExchangeOut(exchangeOut);
        const closingBalanceUzs = openingBalanceUzs
          .plus(incomeUzs)
          .minus(expenseUzs)
          .plus(exchangeInAmounts.uzs)
          .minus(exchangeOutAmounts.uzs);
        const closingBalanceUsd = openingBalanceUsd
          .plus(incomeUsd)
          .minus(expenseUsd)
          .plus(exchangeInAmounts.usd)
          .minus(exchangeOutAmounts.usd);

        return {
          account,
          point: account.type,
          openingBalanceUzs: openingBalanceUzs.toNumber(),
          incomeUzs: incomeUzs.toNumber(),
          expenseUzs: expenseUzs.toNumber(),
          exchangeInUzs: exchangeInAmounts.uzs.toNumber(),
          exchangeOutUzs: exchangeOutAmounts.uzs.toNumber(),
          closingBalanceUzs: closingBalanceUzs.toNumber(),
          openingBalanceUsd: openingBalanceUsd.toNumber(),
          incomeUsd: incomeUsd.toNumber(),
          expenseUsd: expenseUsd.toNumber(),
          exchangeInUsd: exchangeInAmounts.usd.toNumber(),
          exchangeOutUsd: exchangeOutAmounts.usd.toNumber(),
          closingBalanceUsd: closingBalanceUsd.toNumber(),
          totalInUzs: closingBalanceUzs.plus(closingBalanceUsd.mul(reportRate)).toNumber(),
          totalInUsd: closingBalanceUsd.plus(closingBalanceUzs.div(reportRate)).toNumber(),
        };
      }),
    );
  }

  private async calculateOpening(accountId: string, fromDate: Date | undefined, reportDate: Date): Promise<MoneyPair> {
    const opening = await this.prisma.openingBalance.findFirst({
      where: {
        cashAccountId: accountId,
        deletedAt: null,
        date: { lte: fromDate ?? reportDate },
      },
      orderBy: { date: 'desc' },
    });

    const base = {
      uzs: new Prisma.Decimal(opening?.amountUzs ?? 0),
      usd: new Prisma.Decimal(opening?.amountUsd ?? 0),
    };

    if (!fromDate) {
      return base;
    }

    const afterOpeningDate = opening?.date ? { gt: opening.date, lt: fromDate } : { lt: fromDate };
    const [transactions, exchangeIn, exchangeOut] = await Promise.all([
      this.prisma.transaction.aggregate({
        where: {
          cashAccountId: accountId,
          deletedAt: null,
          date: afterOpeningDate,
        },
        _sum: { signedTotalUzs: true, signedTotalUsd: true },
      }),
      this.prisma.exchangeTransaction.findMany({
        where: {
          toAccountId: accountId,
          deletedAt: null,
          date: afterOpeningDate,
        },
      }),
      this.prisma.exchangeTransaction.findMany({
        where: {
          fromAccountId: accountId,
          deletedAt: null,
          date: afterOpeningDate,
        },
      }),
    ]);

    const exchangeInAmounts = this.sumExchangeIn(exchangeIn);
    const exchangeOutAmounts = this.sumExchangeOut(exchangeOut);

    return {
      uzs: base.uzs
        .plus(transactions._sum.signedTotalUzs ?? 0)
        .plus(exchangeInAmounts.uzs)
        .minus(exchangeOutAmounts.uzs),
      usd: base.usd
        .plus(transactions._sum.signedTotalUsd ?? 0)
        .plus(exchangeInAmounts.usd)
        .minus(exchangeOutAmounts.usd),
    };
  }

  private sumExchangeIn(rows: Array<{ currencyTo: CurrencyCode; amountTo: Prisma.Decimal }>): MoneyPair {
    return rows.reduce(
      (sum, row) => {
        if (row.currencyTo === CurrencyCode.UZS) sum.uzs = sum.uzs.plus(row.amountTo);
        if (row.currencyTo === CurrencyCode.USD) sum.usd = sum.usd.plus(row.amountTo);
        return sum;
      },
      { uzs: new Prisma.Decimal(0), usd: new Prisma.Decimal(0) },
    );
  }

  private sumExchangeOut(rows: Array<{ currencyFrom: CurrencyCode; amountFrom: Prisma.Decimal }>): MoneyPair {
    return rows.reduce(
      (sum, row) => {
        if (row.currencyFrom === CurrencyCode.UZS) sum.uzs = sum.uzs.plus(row.amountFrom);
        if (row.currencyFrom === CurrencyCode.USD) sum.usd = sum.usd.plus(row.amountFrom);
        return sum;
      },
      { uzs: new Prisma.Decimal(0), usd: new Prisma.Decimal(0) },
    );
  }

  private normalizeDate(value: string) {
    const [year, month, day] = value.slice(0, 10).split('-').map(Number);
    return new Date(year, month - 1, day);
  }
}
