import { Injectable } from '@nestjs/common';
import { CurrencyCode, TransactionType } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RatesService } from '../rates/rates.service';

@Injectable()
export class OtherCounterpartiesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ratesService: RatesService,
  ) {}

  async report(from?: string, to?: string, counterpartyId?: string, currency?: CurrencyCode) {
    const date = { gte: from ? new Date(from) : undefined, lte: to ? new Date(to) : undefined };
    const rate = await this.ratesService.getRateByDate(CurrencyCode.USD, new Date());
    const counterparties = await this.prisma.counterparty.findMany({
      where: { id: counterpartyId, type: { in: ['SUPPLIER', 'CUSTOMER'] }, deletedAt: null },
      orderBy: { name: 'asc' },
    });

    return Promise.all(counterparties.map(async (counterparty) => {
      const [utility, expense, paid] = await Promise.all([
        this.prisma.utilityAccrual.aggregate({
          where: { counterpartyId: counterparty.id, currencyCode: currency, date, deletedAt: null },
          _sum: { amountUzs: true, amountUsd: true },
        }),
        this.prisma.expenseAccrual.aggregate({
          where: { counterpartyId: counterparty.id, date, deletedAt: null },
          _sum: { accruedUzs: true, paidUzs: true },
        }),
        this.prisma.transaction.aggregate({
          where: { counterpartyId: counterparty.id, type: TransactionType.EXPENSE, date, deletedAt: null },
          _sum: { totalUzs: true, totalUsd: true },
        }),
      ]);
      const accruedUzs = Number(utility._sum.amountUzs ?? 0) + Number(expense._sum.accruedUzs ?? 0);
      const accruedUsd = Number(utility._sum.amountUsd ?? 0);
      const paidUzs = Number(paid._sum.totalUzs ?? 0) + Number(expense._sum.paidUzs ?? 0);
      const paidUsd = Number(paid._sum.totalUsd ?? 0);
      const openingDebt = 0;
      const closingDebtUzs = openingDebt + accruedUzs - paidUzs;
      const closingDebtUsd = accruedUsd - paidUsd;

      return {
        counterparty,
        openingDebt,
        accrued: currency === CurrencyCode.USD ? accruedUsd : accruedUzs,
        paid: currency === CurrencyCode.USD ? paidUsd : paidUzs,
        closingDebt: currency === CurrencyCode.USD ? closingDebtUsd : closingDebtUzs,
        currency: currency ?? CurrencyCode.UZS,
        closingDebtUzs,
        closingDebtUsd: closingDebtUsd + closingDebtUzs / rate.toNumber(),
      };
    }));
  }
}
