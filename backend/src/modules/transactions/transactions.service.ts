import { BadRequestException, Injectable } from '@nestjs/common';
import { CurrencyCode, Prisma, TransactionType } from '@prisma/client';
import { RatesService } from '../rates/rates.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionQueryDto } from './dto/transaction-query.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionsRepository } from './transactions.repository';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly transactionsRepository: TransactionsRepository,
    private readonly ratesService: RatesService,
  ) {}

  async findAll(query: TransactionQueryDto) {
    const where: Prisma.TransactionWhereInput = {
      type: query.type,
      cashAccountId: query.cashAccountId,
      counterpartyId: query.counterpartyId,
      movementTypeId: query.movementTypeId,
      cashAccount: query.accountType ? { type: query.accountType } : undefined,
      date: {
        gte: query.from ? new Date(query.from) : undefined,
        lte: query.to ? new Date(query.to) : undefined,
      },
    };

    const [items, total] = await Promise.all([
      this.transactionsRepository.findMany(where, (query.page - 1) * query.limit, query.limit),
      this.transactionsRepository.count(where),
    ]);

    return { items, total, page: query.page, limit: query.limit };
  }

  async create(dto: CreateTransactionDto) {
    return this.persist(dto);
  }

  async update(id: string, dto: UpdateTransactionDto) {
    const current = await this.transactionsRepository.findById(id);
    return this.persist({
      date: dto.date ?? current.date.toISOString(),
      type: dto.type ?? current.type,
      cashAccountId: dto.cashAccountId ?? current.cashAccountId,
      movementTypeId: dto.movementTypeId ?? current.movementTypeId ?? undefined,
      exchangeAccountId: dto.exchangeAccountId ?? current.exchangeAccountId ?? undefined,
      categoryId: dto.categoryId ?? current.categoryId ?? undefined,
      expenseArticleId: dto.expenseArticleId ?? current.expenseArticleId ?? undefined,
      counterpartyId: dto.counterpartyId ?? current.counterpartyId ?? undefined,
      orderId: dto.orderId ?? current.orderId ?? undefined,
      orderStructure: dto.orderStructure ?? current.orderStructure ?? undefined,
      description: dto.description ?? current.description ?? undefined,
      comment: dto.comment ?? current.comment ?? undefined,
      amountUzs: dto.amountUzs ?? current.amountUzs.toNumber(),
      amountUsd: dto.amountUsd ?? current.amountUsd.toNumber(),
    }, id);
  }

  async remove(id: string) {
    return this.transactionsRepository.remove(id);
  }

  private async persist(dto: CreateTransactionDto, id?: string) {
    if (dto.type === TransactionType.EXCHANGE && !dto.exchangeAccountId) {
      throw new BadRequestException('Exchange transactions require exchangeAccountId');
    }

    const date = new Date(dto.date);
    const rate = await this.ratesService.getRateByDate(CurrencyCode.USD, date);
    const amountUzs = new Prisma.Decimal(dto.amountUzs);
    const amountUsd = new Prisma.Decimal(dto.amountUsd);
    const totalUzs = amountUzs.plus(amountUsd.mul(rate));
    const totalUsd = amountUsd.plus(amountUzs.div(rate));
    const sign = dto.type === TransactionType.EXPENSE ? -1 : 1;
    const signedTotalUzs = dto.type === TransactionType.EXCHANGE ? new Prisma.Decimal(0) : totalUzs.mul(sign);
    const signedTotalUsd = dto.type === TransactionType.EXCHANGE ? new Prisma.Decimal(0) : totalUsd.mul(sign);

    const data: Prisma.TransactionUncheckedCreateInput = {
      date,
      type: dto.type,
      movementTypeId: dto.movementTypeId,
      cashAccountId: dto.cashAccountId,
      exchangeAccountId: dto.exchangeAccountId,
      categoryId: dto.categoryId,
      expenseArticleId: dto.expenseArticleId,
      counterpartyId: dto.counterpartyId,
      orderId: dto.orderId,
      orderStructure: dto.orderStructure,
      description: dto.description,
      amountUzs,
      amountUsd,
      rate,
      totalUzs,
      totalUsd,
      signedTotalUzs,
      signedTotalUsd,
      comment: dto.comment,
    };

    if (id) {
      return this.transactionsRepository.update(id, data);
    }

    return this.transactionsRepository.create(data);
  }
}
