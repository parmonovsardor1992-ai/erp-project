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

  async create(dto: CreateExchangeDto) {
    if (dto.currencyFrom === dto.currencyTo) {
      throw new BadRequestException('Валюты обмена должны отличаться');
    }

    const date = new Date(dto.date);
    const rate = await this.ratesService.getRateByDate(CurrencyCode.USD, date);
    const amountFrom = new Prisma.Decimal(dto.amountFrom);
    const amountTo = dto.amountTo
      ? new Prisma.Decimal(dto.amountTo)
      : dto.currencyFrom === CurrencyCode.UZS
        ? amountFrom.div(rate)
        : amountFrom.mul(rate);

    return this.prisma.exchangeTransaction.create({
      data: {
        date,
        fromAccountId: dto.fromAccountId,
        toAccountId: dto.toAccountId,
        currencyFrom: dto.currencyFrom,
        currencyTo: dto.currencyTo,
        amountFrom,
        amountTo,
        rate,
        comment: dto.comment,
      },
      include: { fromAccount: true, toAccount: true },
    });
  }

  async update(id: string, dto: CreateExchangeDto) {
    await this.findOne(id);
    const created = await this.create(dto);
    await this.remove(id);
    return created;
  }

  remove(id: string) {
    return this.prisma.exchangeTransaction.delete({ where: { id } });
  }
}
