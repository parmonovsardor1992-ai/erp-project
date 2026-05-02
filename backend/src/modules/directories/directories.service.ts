import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CounterpartyType, CurrencyCode } from '@prisma/client';
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
  findFirst(args: unknown): Promise<unknown | null>;
  create(args: unknown): Promise<unknown>;
  update(args: unknown): Promise<unknown>;
  delete(args: unknown): Promise<unknown>;
};

@Injectable()
export class DirectoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(name: DirectoryName, search?: string) {
    if (name === 'employees') {
      return this.listEmployees(search);
    }

    return this.getModel(name).findMany({
      where: this.baseWhere(name, search),
      orderBy: this.orderBy(name),
    });
  }

  async findOne(name: DirectoryName, id: string) {
    if (name === 'employees') {
      const employee = await this.prisma.employee.findFirst({
        where: { id, deletedAt: null, counterparty: { deletedAt: null } },
        include: { counterparty: true, department: true },
      });
      if (!employee) throw new NotFoundException('Сотрудник не найден.');
      return this.toEmployeeDirectoryRow(employee);
    }

    const item = await this.getModel(name).findFirst({ where: { id, deletedAt: null } });
    if (!item) throw new NotFoundException('Элемент справочника не найден.');
    return item;
  }

  async create(name: DirectoryName, body: Record<string, unknown>, userId = 'system') {
    if (name === 'employees') {
      return this.createEmployee(body, userId);
    }

    const data = await this.normalizeData(name, body);
    return this.getModel(name).create({ data: { ...data, createdBy: userId } });
  }

  async update(name: DirectoryName, id: string, body: Record<string, unknown>, userId = 'system') {
    if (name === 'employees') {
      return this.updateEmployee(id, body, userId);
    }

    const data = await this.normalizeData(name, body);
    return this.getModel(name).update({ where: { id }, data: { ...data, updatedBy: userId } });
  }

  async remove(name: DirectoryName, id: string, userId = 'system') {
    if (name === 'employees') {
      return this.removeEmployee(id, userId);
    }

    await this.assertNotUsed(name, id);
    return this.getModel(name).update({ where: { id }, data: { deletedAt: new Date(), updatedBy: userId } });
  }

  private async listEmployees(search?: string) {
    const where = {
      deletedAt: null,
      isActive: true,
      counterparty: {
        type: CounterpartyType.EMPLOYEE,
        deletedAt: null,
        ...(search ? { name: { contains: search, mode: 'insensitive' as const } } : {}),
      },
    };
    const employees = await this.prisma.employee.findMany({
      where,
      include: { counterparty: true, department: true },
      orderBy: { counterparty: { name: 'asc' } },
    });

    console.log(`[directories/employees] count=${employees.length}; filter=${JSON.stringify({ deletedAt: null, isActive: true, search })}`);
    return employees.map((employee) => this.toEmployeeDirectoryRow(employee));
  }

  private async createEmployee(body: Record<string, unknown>, userId: string) {
    const name = String(body.name ?? '').trim();
    if (!name) throw new BadRequestException('Имя сотрудника обязательно.');

    return this.prisma.$transaction(async (tx) => {
      const counterparty = await tx.counterparty.create({
        data: {
          name,
          type: CounterpartyType.EMPLOYEE,
          phone: this.optionalString(body.phone),
          taxId: this.optionalString(body.taxId),
          createdBy: userId,
        },
      });
      const employee = await tx.employee.create({
        data: {
          counterpartyId: counterparty.id,
          position: this.optionalString(body.position) ?? 'Сотрудник',
          departmentId: this.optionalString(body.departmentId),
          isActive: true,
          createdBy: userId,
        },
        include: { counterparty: true, department: true },
      });
      return this.toEmployeeDirectoryRow(employee);
    });
  }

  private async updateEmployee(id: string, body: Record<string, unknown>, userId: string) {
    const current = await this.prisma.employee.findFirst({
      where: { id, deletedAt: null },
      include: { counterparty: true },
    });
    if (!current) throw new NotFoundException('Сотрудник не найден.');

    return this.prisma.$transaction(async (tx) => {
      await tx.counterparty.update({
        where: { id: current.counterpartyId },
        data: {
          name: this.optionalString(body.name) ?? current.counterparty.name,
          phone: this.optionalString(body.phone),
          taxId: this.optionalString(body.taxId),
          updatedBy: userId,
        },
      });
      const employee = await tx.employee.update({
        where: { id },
        data: {
          position: this.optionalString(body.position) ?? current.position,
          departmentId: this.optionalString(body.departmentId),
          updatedBy: userId,
        },
        include: { counterparty: true, department: true },
      });
      return this.toEmployeeDirectoryRow(employee);
    });
  }

  private async removeEmployee(id: string, userId: string) {
    const employee = await this.prisma.employee.findFirst({
      where: { id, deletedAt: null },
      include: { counterparty: true },
    });
    if (!employee) throw new NotFoundException('Сотрудник не найден.');

    await this.assertEmployeeNotUsed(employee.id, employee.counterpartyId);
    return this.prisma.$transaction(async (tx) => {
      await tx.employee.update({ where: { id }, data: { deletedAt: new Date(), isActive: false, updatedBy: userId } });
      await tx.counterparty.update({ where: { id: employee.counterpartyId }, data: { deletedAt: new Date(), updatedBy: userId } });
      return { id, deletedAt: new Date() };
    });
  }

  private async assertEmployeeNotUsed(employeeId: string, counterpartyId: string) {
    const [salaryAccruals, salaryRecords, transactions, utility] = await Promise.all([
      this.prisma.salaryAccrual.count({ where: { employeeId, deletedAt: null } }),
      this.prisma.salaryRecord.count({ where: { employeeId: counterpartyId, deletedAt: null } }),
      this.prisma.transaction.count({ where: { counterpartyId, deletedAt: null } }),
      this.prisma.utilityAccrual.count({ where: { counterpartyId, deletedAt: null } }),
    ]);
    if (salaryAccruals + salaryRecords + transactions + utility > 0) {
      throw new BadRequestException('Нельзя удалить: сотрудник используется в документах.');
    }
  }

  private toEmployeeDirectoryRow(employee: {
    id: string;
    position: string;
    departmentId: string | null;
    isActive: boolean;
    counterparty: { id: string; name: string; phone: string | null; taxId: string | null; type: string };
    department?: { id: string; name: string } | null;
  }) {
    return {
      id: employee.id,
      counterpartyId: employee.counterparty.id,
      name: employee.counterparty.name,
      phone: employee.counterparty.phone,
      taxId: employee.counterparty.taxId,
      type: employee.counterparty.type,
      position: employee.position,
      departmentId: employee.departmentId ?? '',
      department: employee.department,
      isActive: employee.isActive,
    };
  }

  private optionalString(value: unknown) {
    const text = typeof value === 'string' ? value.trim() : '';
    return text || undefined;
  }

  private getModel(name: DirectoryName): PrismaModel {
    const modelName = directoryMap[name];
    const model = (this.prisma as unknown as Record<string, PrismaModel | undefined>)[modelName];
    if (!model) throw new NotFoundException('Справочник не найден.');
    return model;
  }

  private baseWhere(name: DirectoryName, search?: string) {
    const where: Record<string, unknown> = { deletedAt: null };
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
