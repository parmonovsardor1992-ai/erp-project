import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CurrencyCode } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';

export type DirectoryName =
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

type PrismaModel = {
  findMany(args?: unknown): Promise<unknown[]>;
  findUnique(args: unknown): Promise<unknown | null>;
  create(args: unknown): Promise<unknown>;
  update(args: unknown): Promise<unknown>;
  delete(args: unknown): Promise<unknown>;
};

@Injectable()
export class DirectoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(name: DirectoryName, search?: string) {
    return this.getModel(name).findMany({
      where: this.baseWhere(name, search),
      orderBy: this.orderBy(name),
    });
  }

  async findOne(name: DirectoryName, id: string) {
    const item = await this.getModel(name).findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Элемент справочника не найден.');
    return item;
  }

  async create(name: DirectoryName, body: Record<string, unknown>) {
    const data = await this.normalizeData(name, body);
    return this.getModel(name).create({ data });
  }

  async update(name: DirectoryName, id: string, body: Record<string, unknown>) {
    const data = await this.normalizeData(name, body);
    return this.getModel(name).update({ where: { id }, data });
  }

  async remove(name: DirectoryName, id: string) {
    await this.assertNotUsed(name, id);
    return this.getModel(name).delete({ where: { id } });
  }

  private getModel(name: DirectoryName): PrismaModel {
    const modelName = directoryMap[name];
    const model = (this.prisma as unknown as Record<string, PrismaModel | undefined>)[modelName];
    if (!model) throw new NotFoundException('Справочник не найден.');
    return model;
  }

  private baseWhere(name: DirectoryName, search?: string) {
    const where: Record<string, unknown> = {};
    if (name === 'customers') where.type = 'CUSTOMER';
    if (name === 'suppliers') where.type = 'SUPPLIER';
    if (name === 'employees') where.type = 'EMPLOYEE';
    if (search && ['customers', 'suppliers', 'employees', 'products', 'cash-accounts', 'movement-types', 'expense-articles', 'departments'].includes(name)) {
      where.name = { contains: search, mode: 'insensitive' };
    }
    if (search && name === 'settings') {
      where.key = { contains: search, mode: 'insensitive' };
    }
    return where;
  }

  private orderBy(name: DirectoryName) {
    if (name === 'currency-rates') return [{ date: 'desc' }];
    if (name === 'settings') return [{ key: 'asc' }];
    if (name === 'movement-types') return [{ paymentType: 'asc' }, { name: 'asc' }];
    if (name === 'cash-accounts') return [{ type: 'asc' }, { name: 'asc' }];
    return [{ name: 'asc' }];
  }

  private async normalizeData(name: DirectoryName, body: Record<string, unknown>) {
    if (name === 'customers') return { ...body, type: 'CUSTOMER' };
    if (name === 'suppliers') return { ...body, type: 'SUPPLIER' };
    if (name === 'employees') return { ...body, type: 'EMPLOYEE' };
    if (name === 'currency-rates') {
      const code = body.code as CurrencyCode;
      const currency = await this.prisma.currency.findUniqueOrThrow({ where: { code } });
      return {
        currencyId: currency.id,
        code,
        date: new Date(body.date as string),
        rateToUzs: body.rateToUzs,
      };
    }
    return body;
  }

  private async assertNotUsed(name: DirectoryName, id: string) {
    if (['customers', 'suppliers', 'employees'].includes(name)) {
      const [transactions, orders, utility, salary] = await Promise.all([
        this.prisma.transaction.count({ where: { counterpartyId: id } }),
        this.prisma.order.count({ where: { counterpartyId: id } }),
        this.prisma.utilityAccrual.count({ where: { counterpartyId: id } }),
        this.prisma.salaryAccrual.count({ where: { counterpartyId: id } }),
      ]);
      if (transactions + orders + utility + salary > 0) throw new BadRequestException('Нельзя удалить: элемент используется в документах.');
    }
    if (name === 'cash-accounts') {
      const [transactions, fromExchanges, toExchanges] = await Promise.all([
        this.prisma.transaction.count({ where: { cashAccountId: id } }),
        this.prisma.exchangeTransaction.count({ where: { fromAccountId: id } }),
        this.prisma.exchangeTransaction.count({ where: { toAccountId: id } }),
      ]);
      if (transactions + fromExchanges + toExchanges > 0) throw new BadRequestException('Нельзя удалить: счет используется в операциях.');
    }
    if (name === 'movement-types') {
      const count = await this.prisma.transaction.count({ where: { movementTypeId: id } });
      if (count > 0) throw new BadRequestException('Нельзя удалить: тип движения используется в операциях.');
    }
    if (name === 'expense-articles') {
      const [transactions, utilities] = await Promise.all([
        this.prisma.transaction.count({ where: { expenseArticleId: id } }),
        this.prisma.utilityAccrual.count({ where: { expenseArticleId: id } }),
      ]);
      if (transactions + utilities > 0) throw new BadRequestException('Нельзя удалить: статья используется в документах.');
    }
  }
}
