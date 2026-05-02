import { Injectable } from '@nestjs/common';
import { CurrencyCode, Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RatesService } from '../rates/rates.service';
import { CreateUtilityAccrualDto } from './dto/create-utility-accrual.dto';

@Injectable()
export class UtilityAccrualsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ratesService: RatesService,
  ) {}

  findAll() {
    return this.prisma.utilityAccrual.findMany({
      include: { counterparty: true, category: true, expenseArticle: true },
      orderBy: { date: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.utilityAccrual.findUniqueOrThrow({
      where: { id },
      include: { counterparty: true, category: true, expenseArticle: true },
    });
  }

  async create(dto: CreateUtilityAccrualDto) {
    const date = new Date(dto.date);
    const rate = await this.ratesService.getRateByDate(CurrencyCode.USD, date);
    const amount = new Prisma.Decimal(dto.amount);
    const amountUzs = dto.currencyCode === CurrencyCode.USD ? amount.mul(rate) : amount;
    const amountUsd = dto.currencyCode === CurrencyCode.UZS ? amount.div(rate) : amount;

    return this.prisma.utilityAccrual.create({
      data: {
        date,
        counterpartyId: dto.counterpartyId,
        categoryId: dto.categoryId,
        expenseArticleId: dto.expenseArticleId,
        currencyCode: dto.currencyCode,
        amount,
        rate,
        amountUzs,
        amountUsd,
        comment: dto.comment,
      },
      include: { counterparty: true, category: true, expenseArticle: true },
    });
  }

  remove(id: string) {
    return this.prisma.utilityAccrual.delete({ where: { id } });
  }

  async update(id: string, dto: CreateUtilityAccrualDto) {
    await this.remove(id);
    return this.create(dto);
  }
}
