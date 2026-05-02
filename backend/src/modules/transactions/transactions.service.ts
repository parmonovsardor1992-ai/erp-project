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

  async create(dto: CreateTransactionDto, userId = 'system') {
    return this.persist(dto, undefined, userId);
  }

  async update(id: string, dto: UpdateTransactionDto, userId = 'system') {
    const current = await this.prisma.transaction.findFirst({ where: { id, deletedAt: null } });
    if (!current) {
      throw new NotFoundException('Операция не найдена');
    }

    return this.persist(
      {
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
      },
      id,
      userId,
    );
  }

  async remove(id: string, userId = 'system') {
    return this.transactionsRepository.remove(id, userId);
  }

  private async persist(dto: TransactionPersistInput, id?: string, userId = 'system') {
    if (dto.type === TransactionType.EXCHANGE) {
      throw new BadRequestException('Обмен валют нужно оформлять в разделе Обмен валют');
    }

    const allowedTypes: TransactionType[] = [TransactionType.INCOME, TransactionType.EXPENSE];
    if (!allowedTypes.includes(dto.type)) {
      throw new BadRequestException('Недопустимый тип операции');
    }

    const date = this.normalizeDate(dto.date);
    const rate = await this.ratesService.getRateByDate(CurrencyCode.USD, date);
    if (!rate || rate.lte(0)) {
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

    return this.prisma.$transaction(async (tx) => {
      await this.assertPeriodOpen(date, tx);
      await this.validateReferences(dto, tx);

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
        createdBy: id ? undefined : userId,
        updatedBy: id ? userId : undefined,
      };

      if (id) {
        return tx.transaction.update({
          where: { id },
          data,
          include: {
            cashAccount: true,
            category: true,
            expenseArticle: true,
            counterparty: true,
            movementType: true,
            order: true,
          },
        });
      }

      return tx.transaction.create({
        data,
        include: {
          cashAccount: true,
          category: true,
          expenseArticle: true,
          counterparty: true,
          movementType: true,
          order: true,
        },
      });
    });
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

  private async validateReferences(dto: TransactionPersistInput, tx: Prisma.TransactionClient) {
    const cashAccount = await tx.cashAccount.findFirst({ where: { id: dto.cashAccountId, deletedAt: null } });
    if (!cashAccount) {
      throw new BadRequestException('Счет не найден');
    }

    if (dto.movementTypeId) {
      const movementType = await tx.movementType.findFirst({ where: { id: dto.movementTypeId, deletedAt: null } });
      if (!movementType) {
        throw new BadRequestException('Тип движения не найден');
      }
      if (movementType.paymentType !== dto.type) {
        throw new BadRequestException('Тип движения не соответствует типу операции');
      }
    }

    if (dto.counterpartyId) {
      const counterparty = await tx.counterparty.findFirst({ where: { id: dto.counterpartyId, deletedAt: null } });
      if (!counterparty) {
        throw new BadRequestException('Контрагент не найден');
      }
    }

    if (dto.orderId) {
      const order = await tx.order.findFirst({ where: { id: dto.orderId, deletedAt: null } });
      if (!order) {
        throw new BadRequestException('Заказ не найден');
      }
    }
  }

  private async assertPeriodOpen(date: Date, tx: Prisma.TransactionClient) {
    const locked = await tx.periodLock.findFirst({
      where: {
        isLocked: true,
        deletedAt: null,
        dateFrom: { lte: date },
        dateTo: { gte: date },
      },
    });

    if (locked) {
      throw new BadRequestException('Период закрыт. Редактирование запрещено.');
    }
  }
}
