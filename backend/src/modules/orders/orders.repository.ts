import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class OrdersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(validOnly: boolean, filters?: { customerId?: string; dateFrom?: string; dateTo?: string; search?: string }) {
    return this.prisma.order.findMany({
      where: {
        ...(validOnly ? { structure: { not: null } } : {}),
        counterpartyId: filters?.customerId,
        startDate: {
          gte: filters?.dateFrom ? new Date(filters.dateFrom) : undefined,
          lte: filters?.dateTo ? new Date(filters.dateTo) : undefined,
        },
        name: filters?.search ? { contains: filters.search, mode: 'insensitive' } : undefined,
      },
      include: { counterparty: true, transactions: true },
      orderBy: { startDate: 'asc' },
    });
  }

  findById(id: string) {
    return this.prisma.order.findUniqueOrThrow({ where: { id }, include: { counterparty: true, transactions: true } });
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
