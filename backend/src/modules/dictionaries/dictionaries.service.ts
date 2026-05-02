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
      this.prisma.counterparty.findMany({ where: { type: 'CUSTOMER' }, orderBy: { name: 'asc' } }),
      this.prisma.counterparty.findMany({ where: { type: 'SUPPLIER' }, orderBy: { name: 'asc' } }),
      this.prisma.counterparty.findMany({ where: { type: 'EMPLOYEE' }, orderBy: { name: 'asc' } }),
      this.prisma.product.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }),
      this.prisma.currency.findMany({ orderBy: { code: 'asc' } }),
      this.prisma.currencyRate.findMany({ orderBy: [{ date: 'desc' }, { code: 'asc' }] }),
      this.prisma.cashAccount.findMany({ where: { isActive: true }, orderBy: [{ type: 'asc' }, { name: 'asc' }] }),
      this.prisma.movementType.findMany({ orderBy: [{ paymentType: 'asc' }, { name: 'asc' }] }),
      this.prisma.category.findMany({ where: { type: 'EXPENSE' }, orderBy: { name: 'asc' } }),
      this.prisma.expenseArticle.findMany({ orderBy: [{ section: 'asc' }, { name: 'asc' }] }),
      this.prisma.department.findMany({ orderBy: { name: 'asc' } }),
      this.prisma.employee.findMany({ include: { counterparty: true, department: true }, orderBy: { counterparty: { name: 'asc' } } }),
      this.prisma.order.findMany({
        where: { structure: { not: null } },
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
