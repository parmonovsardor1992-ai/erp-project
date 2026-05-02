import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class CounterpartiesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAllWithAccruals() {
    return this.prisma.counterparty.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
      include: { expenseAccruals: { where: { deletedAt: null } } },
    });
  }

  create(data: Prisma.CounterpartyCreateInput) {
    return this.prisma.counterparty.create({ data: { ...data, createdBy: 'system' } });
  }

  update(id: string, data: Prisma.CounterpartyUpdateInput) {
    return this.prisma.counterparty.update({ where: { id }, data: { ...data, updatedBy: 'system' } });
  }

  remove(id: string) {
    return this.prisma.counterparty.update({ where: { id }, data: { deletedAt: new Date(), updatedBy: 'system' } });
  }
}
