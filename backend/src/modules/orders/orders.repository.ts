import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class OrdersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(validOnly: boolean) {
    return this.prisma.order.findMany({
      where: validOnly ? { structure: { not: null } } : undefined,
      include: { counterparty: true },
      orderBy: { startDate: 'asc' },
    });
  }

  findById(id: string) {
    return this.prisma.order.findUniqueOrThrow({ where: { id }, include: { counterparty: true } });
  }

  create(data: Prisma.OrderUncheckedCreateInput) {
    return this.prisma.order.create({ data });
  }

  update(id: string, data: Prisma.OrderUncheckedUpdateInput) {
    return this.prisma.order.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.order.delete({ where: { id } });
  }
}
