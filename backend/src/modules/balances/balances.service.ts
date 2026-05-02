import { Injectable } from '@nestjs/common';
import { CashAccountType, CurrencyCode, TransactionType } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RatesService } from '../rates/rates.service';
import { BalancesRepository } from './balances.repository';

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
    const rate = await this.ratesService.getRateByDate(CurrencyCode.USD, new Date());
    const accounts = await this.prisma.cashAccount.findMany({
      where: { isActive: true, type: accountType },
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
    });
    const dateFilter = {
      gte: from ? new Date(from) : undefined,
      lte: to ? new Date(to) : undefined,
    };

    return Promise.all(accounts.map(async (account) => {
      const [opening, income, expense, exchangeIn, exchangeOut] = await Promise.all([
        this.prisma.openingBalance.findFirst({ where: { cashAccountId: account.id }, orderBy: { date: 'desc' } }),
        this.prisma.transaction.aggregate({
          where: { cashAccountId: account.id, type: TransactionType.INCOME, date: dateFilter },
          _sum: { totalUzs: true, totalUsd: true },
        }),
        this.prisma.transaction.aggregate({
          where: { cashAccountId: account.id, type: TransactionType.EXPENSE, date: dateFilter },
          _sum: { totalUzs: true, totalUsd: true },
        }),
        this.prisma.exchangeTransaction.findMany({ where: { toAccountId: account.id, date: dateFilter } }),
        this.prisma.exchangeTransaction.findMany({ where: { fromAccountId: account.id, date: dateFilter } }),
      ]);

      const openingBalanceUzs = Number(opening?.amountUzs ?? 0);
      const openingBalanceUsd = Number(opening?.amountUsd ?? 0);
      const incomeUzs = Number(income._sum.totalUzs ?? 0);
      const incomeUsd = Number(income._sum.totalUsd ?? 0);
      const expenseUzs = Number(expense._sum.totalUzs ?? 0);
      const expenseUsd = Number(expense._sum.totalUsd ?? 0);
      const exchangeInUzs = exchangeIn.reduce((sum, row) => sum + (row.currencyTo === CurrencyCode.UZS ? row.amountTo.toNumber() : 0), 0);
      const exchangeInUsd = exchangeIn.reduce((sum, row) => sum + (row.currencyTo === CurrencyCode.USD ? row.amountTo.toNumber() : 0), 0);
      const exchangeOutUzs = exchangeOut.reduce((sum, row) => sum + (row.currencyFrom === CurrencyCode.UZS ? row.amountFrom.toNumber() : 0), 0);
      const exchangeOutUsd = exchangeOut.reduce((sum, row) => sum + (row.currencyFrom === CurrencyCode.USD ? row.amountFrom.toNumber() : 0), 0);
      const closingBalanceUzs = openingBalanceUzs + incomeUzs - expenseUzs + exchangeInUzs - exchangeOutUzs;
      const closingBalanceUsd = openingBalanceUsd + incomeUsd - expenseUsd + exchangeInUsd - exchangeOutUsd;

      return {
        account,
        point: account.type,
        openingBalanceUzs,
        incomeUzs,
        expenseUzs,
        exchangeInUzs,
        exchangeOutUzs,
        closingBalanceUzs,
        openingBalanceUsd,
        incomeUsd,
        expenseUsd,
        exchangeInUsd,
        exchangeOutUsd,
        closingBalanceUsd,
        totalInUzs: closingBalanceUzs + closingBalanceUsd * rate.toNumber(),
        totalInUsd: closingBalanceUsd + closingBalanceUzs / rate.toNumber(),
      };
    }));
  }
}
