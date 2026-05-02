import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CurrencyCode, Prisma, TransactionType } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RatesService } from '../rates/rates.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionQueryDto } from './dto/transaction-query.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionsRepository } from './transactions.repository';

type TransactionPersistInput = Omit<CreateTransactionDto, 'date'> & { date: string | Date };

@Injectable()
export class TransactionsService {
  constructor(
    private readonly transactionsRepository: TransactionsRepository,
    private readonly ratesService: RatesService,
    private readonly prisma: PrismaService,
  ) {}

  async findAll(query: TransactionQueryDto) {
    const where: Prisma.TransactionWhereInput = {
      type: query.type,
      cashAccountId: query.cashAccountId,
      counterpartyId: query.counterpartyId,
      movementTypeId: query.movementTypeId,
      cashAccount: query.accountType ? { type: query.accountType } : undefined,
      date: {
        gte: query.from ? this.normalizeDate(query.from) : undefined,
        lte: query.to ? this.normalizeDate(query.to) : undefined,
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
    const current = await this.prisma.transaction.findUnique({ where: { id } });
    if (!current) {
      throw new NotFoundException('Операция не найдена');
    }

    return this.persist({
      date: dto.date ? this.normalizeDate(dto.date) : current.date,
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

  private async persist(dto: TransactionPersistInput, id?: string) {
    const allowedTypes: TransactionType[] = [TransactionType.INCOME, TransactionType.EXPENSE];
    if (!allowedTypes.includes(dto.type)) {
      throw new BadRequestException('Недопустимый тип операции');
    }

    const date = this.normalizeDate(dto.date);
    const rate = await this.ratesService.getRateByDate(CurrencyCode.USD, date);
    if (!rate) {
      throw new BadRequestException('Курс валюты на выбранную дату не найден');
    }

    const amountUzs = this.toDecimal(dto.amountUzs ?? 0);
    const amountUsd = this.toDecimal(dto.amountUsd ?? 0);

    if (amountUzs.isNegative() || amountUsd.isNegative()) {
      throw new BadRequestException('Сумма не может быть отрицательной');
    }

    if (amountUzs.eq(0) && amountUsd.eq(0)) {
      throw new BadRequestException('Нельзя сохранить операцию с нулевой суммой');
    }

    await this.validateReferences(dto);

    const totalUzs = amountUzs.plus(amountUsd.mul(rate));
    const totalUsd = amountUsd.plus(amountUzs.div(rate));
    const sign = dto.type === TransactionType.INCOME ? 1 : -1;
    const signedTotalUzs = totalUzs.mul(sign);
    const signedTotalUsd = totalUsd.mul(sign);

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

  private normalizeDate(value: string | Date) {
    if (value instanceof Date) {
      return new Date(value.getFullYear(), value.getMonth(), value.getDate());
    }

    const [year, month, day] = value.slice(0, 10).split('-').map(Number);
    if (!year || !month || !day) {
      throw new BadRequestException('Некорректная дата операции');
    }

    return new Date(year, month - 1, day);
  }

  private toDecimal(value: number) {
    if (!Number.isFinite(value)) {
      throw new BadRequestException('Сумма должна быть числом');
    }

    return new Prisma.Decimal(value);
  }

  private async validateReferences(dto: TransactionPersistInput) {
    const cashAccount = await this.prisma.cashAccount.findUnique({ where: { id: dto.cashAccountId } });
    if (!cashAccount) {
      throw new BadRequestException('Счет не найден');
    }

    if (dto.movementTypeId) {
      const movementType = await this.prisma.movementType.findUnique({ where: { id: dto.movementTypeId } });
      if (!movementType) {
        throw new BadRequestException('Тип движения не найден');
      }
      if (movementType.paymentType !== dto.type) {
        throw new BadRequestException('Тип движения не соответствует типу операции');
      }
    }

    if (dto.counterpartyId) {
      const counterparty = await this.prisma.counterparty.findUnique({ where: { id: dto.counterpartyId } });
      if (!counterparty) {
        throw new BadRequestException('Контрагент не найден');
      }
    }
  }
}
