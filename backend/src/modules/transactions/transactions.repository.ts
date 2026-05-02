import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class TransactionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findMany(where: Prisma.TransactionWhereInput, skip: number, take: number) {
    return this.prisma.transaction.findMany({
      where: { ...where, deletedAt: null },
      include: { cashAccount: true, category: true, expenseArticle: true, counterparty: true, movementType: true, order: true },
      orderBy: { date: 'desc' },
      skip,
      take,
    });
  }

  count(where: Prisma.TransactionWhereInput) {
    return this.prisma.transaction.count({ where: { ...where, deletedAt: null } });
  }

  findById(id: string) {
    return this.prisma.transaction.findFirstOrThrow({ where: { id, deletedAt: null } });
  }

  create(data: Prisma.TransactionUncheckedCreateInput) {
    return this.prisma.transaction.create({ data, include: { cashAccount: true, category: true, expenseArticle: true, counterparty: true, movementType: true, order: true } });
  }

  update(id: string, data: Prisma.TransactionUncheckedUpdateInput) {
    return this.prisma.transaction.update({ where: { id }, data, include: { cashAccount: true, category: true, expenseArticle: true, counterparty: true, movementType: true, order: true } });
  }

  remove(id: string) {
    return this.prisma.transaction.update({ where: { id }, data: { deletedAt: new Date(), updatedBy: 'system' } });
  }
}
