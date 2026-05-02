import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class TransactionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findMany(where: Prisma.TransactionWhereInput, skip: number, take: number) {
    return this.prisma.transaction.findMany({
      where,
      include: { cashAccount: true, category: true, expenseArticle: true, counterparty: true, movementType: true, order: true },
      orderBy: { date: 'desc' },
      skip,
      take,
    });
  }

  count(where: Prisma.TransactionWhereInput) {
    return this.prisma.transaction.count({ where });
  }

  findById(id: string) {
    return this.prisma.transaction.findUniqueOrThrow({ where: { id } });
  }

  create(data: Prisma.TransactionUncheckedCreateInput) {
    return this.prisma.transaction.create({ data, include: { cashAccount: true, category: true, expenseArticle: true, counterparty: true, movementType: true, order: true } });
  }

  update(id: string, data: Prisma.TransactionUncheckedUpdateInput) {
    return this.prisma.transaction.update({ where: { id }, data, include: { cashAccount: true, category: true, expenseArticle: true, counterparty: true, movementType: true, order: true } });
  }

  remove(id: string) {
    return this.prisma.transaction.delete({ where: { id } });
  }
}
