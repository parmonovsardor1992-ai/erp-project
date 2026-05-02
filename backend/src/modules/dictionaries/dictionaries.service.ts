import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class DictionariesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const [
      customers,
      suppliers,
      employees,
      products,
      currencies,
      currencyRates,
      cashAccounts,
      movementTypes,
      expenseCategories,
      expenseArticles,
      departments,
      employeesDetailed,
      orders,
    ] = await Promise.all([
      this.prisma.counterparty.findMany({ where: { type: 'CUSTOMER', deletedAt: null }, orderBy: { name: 'asc' } }),
      this.prisma.counterparty.findMany({ where: { type: 'SUPPLIER', deletedAt: null }, orderBy: { name: 'asc' } }),
      this.prisma.counterparty.findMany({ where: { type: 'EMPLOYEE', deletedAt: null }, orderBy: { name: 'asc' } }),
      this.prisma.product.findMany({ where: { isActive: true, deletedAt: null }, orderBy: { name: 'asc' } }),
      this.prisma.currency.findMany({ where: { deletedAt: null }, orderBy: { code: 'asc' } }),
      this.prisma.currencyRate.findMany({ where: { deletedAt: null }, orderBy: [{ date: 'desc' }, { code: 'asc' }] }),
      this.prisma.cashAccount.findMany({ where: { isActive: true, deletedAt: null }, orderBy: [{ type: 'asc' }, { name: 'asc' }] }),
      this.prisma.movementType.findMany({ where: { deletedAt: null }, orderBy: [{ paymentType: 'asc' }, { name: 'asc' }] }),
      this.prisma.category.findMany({ where: { type: 'EXPENSE', deletedAt: null }, orderBy: { name: 'asc' } }),
      this.prisma.expenseArticle.findMany({ where: { deletedAt: null }, orderBy: [{ section: 'asc' }, { name: 'asc' }] }),
      this.prisma.department.findMany({ where: { deletedAt: null }, orderBy: { name: 'asc' } }),
      this.prisma.employee.findMany({
        where: { deletedAt: null, isActive: true, counterparty: { deletedAt: null } },
        include: { counterparty: true, department: true },
        orderBy: { counterparty: { name: 'asc' } },
      }),
      this.prisma.order.findMany({
        where: { structure: { not: null }, deletedAt: null },
        include: { counterparty: true },
        orderBy: { startDate: 'asc' },
      }),
    ]);

    return {
      customers,
      suppliers,
      employees,
      counterparties: [...customers, ...suppliers, ...employees],
      products,
      currencies,
      currencyRates,
      cashAccounts,
      movementTypes,
      expenseCategories,
      expenseArticles,
      departments,
      employeesDetailed,
      orders,
      paymentTypes: [
        { id: 'INCOME', name: 'Приход' },
        { id: 'EXPENSE', name: 'Расход' },
        { id: 'EXCHANGE', name: 'Обмен' },
      ],
      cashAccountTypes: [
        { id: 'CASH', name: 'Касса' },
        { id: 'BANK', name: 'Банк' },
        { id: 'CARD', name: 'Карта' },
      ],
    };
  }
}
