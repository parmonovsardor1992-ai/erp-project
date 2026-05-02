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
      include: { fromAccount: true, toAccount: true },
      orderBy: { date: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.exchangeTransaction.findUniqueOrThrow({
      where: { id },
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
    return this.prisma.exchangeTransaction.delete({ where: { id } });
  }

  private async persist(dto: CreateExchangeDto, id?: string) {
    if (dto.currencyFrom === dto.currencyTo) {
      throw new BadRequestException('Валюты обмена должны отличаться.');
    }

    const date = new Date(dto.date);
    const rate = await this.ratesService.getRateByDate(CurrencyCode.USD, date);
    const amountFrom = new Prisma.Decimal(dto.amountFrom);
    if (amountFrom.lte(0)) {
      throw new BadRequestException('Сумма обмена должна быть больше нуля.');
    }

    const amountTo = dto.currencyFrom === CurrencyCode.UZS ? amountFrom.div(rate) : amountFrom.mul(rate);

    if (dto.amountTo !== undefined) {
      const enteredAmountTo = new Prisma.Decimal(dto.amountTo);
      if (enteredAmountTo.minus(amountTo).abs().gt(new Prisma.Decimal(0.01))) {
        throw new BadRequestException('Сумма получения не совпадает с расчетом по курсу.');
      }
    }

    const data = {
      date,
      fromAccountId: dto.fromAccountId,
      toAccountId: dto.toAccountId,
      currencyFrom: dto.currencyFrom,
      currencyTo: dto.currencyTo,
      amountFrom,
      amountTo,
      rate,
      comment: dto.comment,
    };

    if (id) {
      return this.prisma.exchangeTransaction.update({
        where: { id },
        data,
        include: { fromAccount: true, toAccount: true },
      });
    }

    return this.prisma.exchangeTransaction.create({
      data,
      include: { fromAccount: true, toAccount: true },
    });
  }
}
