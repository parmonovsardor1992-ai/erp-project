import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

type DirectoryName =
  | 'customers'
  | 'suppliers'
  | 'employees'
  | 'products'
  | 'currencies'
  | 'currency-rates'
  | 'cash-accounts'
  | 'payment-types'
  | 'movement-types'
  | 'expense-articles'
  | 'departments'
  | 'settings';

const directoryMap: Record<DirectoryName, string> = {
  customers: 'counterparty',
  suppliers: 'counterparty',
  employees: 'counterparty',
  products: 'product',
  currencies: 'currency',
  'currency-rates': 'currencyRate',
  'cash-accounts': 'cashAccount',
  'payment-types': 'paymentType',
  'movement-types': 'movementType',
  'expense-articles': 'expenseArticle',
  departments: 'department',
  settings: 'setting',
};

@Injectable()
export class DirectoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(name: DirectoryName, search?: string) {
    const model = this.getModel(name);
    const where = this.baseWhere(name, search);
    return model.findMany({ where, orderBy: this.orderBy(name) });
  }

  async findOne(name: DirectoryName, id: string) {
    const item = await this.getModel(name).findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Элемент справочника не найден');
    return item;
  }

  async create(name: DirectoryName, body: Record<string, unknown>) {
    const data = this.normalizeData(name, body);
    return this.getModel(name).create({ data });
  }

  async update(name: DirectoryName, id: string, body: Record<string, unknown>) {
    const data = this.normalizeData(name, body);
    return this.getModel(name).update({ where: { id }, data });
  }

  async remove(name: DirectoryName, id: string) {
    await this.assertNotUsed(name, id);
    return this.getModel(name).delete({ where: { id } });
  }

  private getModel(name: DirectoryName) {
    const modelName = directoryMap[name];
    const model = (this.prisma as unknown as Record<string, { findMany: Function; findUnique: Function; create: Function; update: Function; delete: Function }>)[modelName];
    if (!model) throw new NotFoundException('Справочник не найден');
    return model;
  }

  private baseWhere(name: DirectoryName, search?: string) {
    const typeByName: Partial<Record<DirectoryName, string>> = {
      customers: 'CUSTOMER',
      suppliers: 'SUPPLIER',
      employees: 'EMPLOYEE',
    };
    const where: Record<string, unknown> = {};
    if (typeByName[name]) where.type = typeByName[name];
    if (search) where.name = { contains: search, mode: 'insensitive' };
    return where;
  }

  private orderBy(name: DirectoryName) {
    if (name === 'currency-rates') return [{ date: 'desc' }];
    if (name === 'settings') return [{ key: 'asc' }];
    if (name === 'payment-types') return [{ name: 'asc' }];
    return [{ name: 'asc' }];
  }

  private normalizeData(name: DirectoryName, body: Record<string, unknown>) {
    if (name === 'customers') return { ...body, type: 'CUSTOMER' };
    if (name === 'suppliers') return { ...body, type: 'SUPPLIER' };
    if (name === 'employees') return { ...body, type: 'EMPLOYEE' };
    return body;
  }

  private async assertNotUsed(name: DirectoryName, id: string) {
    if (['customers', 'suppliers', 'employees'].includes(name)) {
      const [transactions, orders, utility] = await Promise.all([
        this.prisma.transaction.count({ where: { counterpartyId: id } }),
        this.prisma.order.count({ where: { counterpartyId: id } }),
        this.prisma.utilityAccrual.count({ where: { counterpartyId: id } }),
      ]);
      if (transactions + orders + utility > 0) throw new BadRequestException('Нельзя удалить: элемент используется в документах');
    }
    if (name === 'cash-accounts') {
      const count = await this.prisma.transaction.count({ where: { cashAccountId: id } });
      if (count > 0) throw new BadRequestException('Нельзя удалить: счет используется в операциях');
    }
  }
}
