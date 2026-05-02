import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class BalancesRepository {
  constructor(private readonly prisma: PrismaService) {}

  activeAccounts() {
    return this.prisma.cashAccount.findMany({
      where: { isActive: true },
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
    });
  }

  groupedTransactionSums() {
    return this.prisma.transaction.groupBy({
      by: ['cashAccountId'],
      _sum: { signedTotalUzs: true, signedTotalUsd: true },
    });
  }

  incomeVsExpense() {
    return this.prisma.transaction.groupBy({
      by: ['type'],
      where: { type: { in: ['INCOME', 'EXPENSE'] } },
      _sum: { totalUzs: true, totalUsd: true },
    });
  }
}
