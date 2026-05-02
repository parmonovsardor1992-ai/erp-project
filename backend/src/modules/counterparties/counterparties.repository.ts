import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class CounterpartiesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAllWithAccruals() {
    return this.prisma.counterparty.findMany({
      orderBy: { name: 'asc' },
      include: { expenseAccruals: true },
    });
  }

  create(data: Prisma.CounterpartyCreateInput) {
    return this.prisma.counterparty.create({ data });
  }

  update(id: string, data: Prisma.CounterpartyUpdateInput) {
    return this.prisma.counterparty.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.counterparty.delete({ where: { id } });
  }
}
