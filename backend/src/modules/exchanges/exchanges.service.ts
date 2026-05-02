import { BadRequestException, Injectable } from '@nestjs/common';
import { CurrencyCode, Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RatesService } from '../rates/rates.service';
import { CreateExchangeDto } from './dto/create-exchange.dto';

@Injectable()
export class ExchangesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ratesService: RatesService,
  ) {}

  findAll() {
    return this.prisma.exchangeTransaction.findMany({
      where: { deletedAt: null },
      include: { fromAccount: true, toAccount: true },
      orderBy: { date: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.exchangeTransaction.findFirstOrThrow({
      where: { id, deletedAt: null },
      include: { fromAccount: true, toAccount: true },
    });
  }

  create(dto: CreateExchangeDto) {
    return this.persist(dto);
  }

  async update(id: string, dto: CreateExchangeDto) {
    await this.findOne(id);
    return this.persist(dto, id);
  }

  remove(id: string) {
    return this.prisma.exchangeTransaction.update({ where: { id }, data: { deletedAt: new Date(), updatedBy: 'system' } });
  }

  private async persist(dto: CreateExchangeDto, id?: string) {
    if (!dto.fromAccountId) {
      throw new BadRequestException('Счет списания не найден');
    }
    if (!dto.toAccountId) {
      throw new BadRequestException('Счет зачисления не найден');
    }
    if (dto.currencyFrom === dto.currencyTo) {
      throw new BadRequestException('Валюты обмена должны отличаться');
    }

    return this.prisma.$transaction(async (tx) => {
      const [fromAccount, toAccount] = await Promise.all([
        tx.cashAccount.findFirst({ where: { id: dto.fromAccountId, deletedAt: null } }),
        tx.cashAccount.findFirst({ where: { id: dto.toAccountId, deletedAt: null } }),
      ]);

      if (!fromAccount) {
        throw new BadRequestException('Счет списания не найден');
      }
      if (!toAccount) {
        throw new BadRequestException('Счет зачисления не найден');
      }

      const date = this.normalizeDate(dto.date);
      await this.assertPeriodOpen(date, tx);
      const rate = await this.ratesService.getRateByDate(CurrencyCode.USD, date);
      if (!rate || rate.lte(0)) {
        throw new BadRequestException('Курс валюты на выбранную дату не найден');
      }

      const amountFrom = new Prisma.Decimal(dto.amountFrom);
      if (amountFrom.lte(0)) {
        throw new BadRequestException('Сумма обмена должна быть больше нуля');
      }

      const expectedAmountTo = dto.currencyFrom === CurrencyCode.UZS ? amountFrom.div(rate) : amountFrom.mul(rate);

      if (dto.amountTo !== undefined) {
        const enteredAmountTo = new Prisma.Decimal(dto.amountTo);
        const allowedDiff = expectedAmountTo.abs().mul(0.01);
        if (enteredAmountTo.minus(expectedAmountTo).abs().gt(allowedDiff)) {
          throw new BadRequestException('Сумма обмена не соответствует курсу');
        }
      }

      const data = {
        date,
        fromAccountId: dto.fromAccountId,
        toAccountId: dto.toAccountId,
        currencyFrom: dto.currencyFrom,
        currencyTo: dto.currencyTo,
        amountFrom,
        amountTo: expectedAmountTo,
        rate,
        comment: dto.comment,
        createdBy: id ? undefined : 'system',
        updatedBy: id ? 'system' : undefined,
      };

      if (id) {
        return tx.exchangeTransaction.update({
          where: { id },
          data,
          include: { fromAccount: true, toAccount: true },
        });
      }

      return tx.exchangeTransaction.create({
        data,
        include: { fromAccount: true, toAccount: true },
      });
    });
  }

  private normalizeDate(value: string) {
    const [year, month, day] = value.slice(0, 10).split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  private async assertPeriodOpen(date: Date, tx: Prisma.TransactionClient) {
    const locked = await tx.periodLock.findFirst({
      where: {
        isClosed: true,
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
