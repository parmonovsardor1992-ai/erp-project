import { Injectable } from '@nestjs/common';
import { TransactionType } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { BalancesService } from '../balances/balances.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly balancesService: BalancesService,
  ) {}

  async summary(from?: string, to?: string) {
    const date = { gte: from ? new Date(from) : undefined, lte: to ? new Date(to) : undefined };
    const [balances, income, expense, activeOrders, salaryRows, utilityDebt] = await Promise.all([
      this.balancesService.report(from, to),
      this.prisma.transaction.aggregate({ where: { type: TransactionType.INCOME, date }, _sum: { totalUzs: true, totalUsd: true } }),
      this.prisma.transaction.aggregate({ where: { type: TransactionType.EXPENSE, date }, _sum: { totalUzs: true, totalUsd: true } }),
      this.prisma.order.count({ where: { structure: { not: null }, status: { in: ['NEW', 'IN_PROGRESS'] } } }),
      this.prisma.salaryAccrual.aggregate({ where: { date }, _sum: { amountUzs: true } }),
      this.prisma.utilityAccrual.aggregate({ where: { date }, _sum: { amountUzs: true } }),
    ]);

    return {
      balances,
      totalUzs: balances.reduce((sum, row) => sum + row.totalInUzs, 0),
      totalUsd: balances.reduce((sum, row) => sum + row.totalInUsd, 0),
      income,
      expense,
      employeeDebts: salaryRows._sum.amountUzs ?? 0,
      counterpartyDebts: utilityDebt._sum.amountUzs ?? 0,
      activeOrders,
    };
  }
}
