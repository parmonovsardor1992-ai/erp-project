import { BadRequestException, Injectable } from '@nestjs/common';
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
      where: { deletedAt: null },
      include: { counterparty: true, category: true, expenseArticle: true },
      orderBy: { date: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.utilityAccrual.findFirstOrThrow({
      where: { id, deletedAt: null },
      include: { counterparty: true, category: true, expenseArticle: true },
    });
  }

  async create(dto: CreateUtilityAccrualDto, userId = 'system') {
    const date = new Date(dto.date);
    await this.assertPeriodOpen(date);
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
        createdBy: userId,
      },
      include: { counterparty: true, category: true, expenseArticle: true },
    });
  }

  async remove(id: string, userId = 'system') {
    const current = await this.findOne(id);
    await this.assertPeriodOpen(current.date);
    return this.prisma.utilityAccrual.update({ where: { id }, data: { deletedAt: new Date(), updatedBy: userId } });
  }

  async update(id: string, dto: CreateUtilityAccrualDto, userId = 'system') {
    await this.remove(id, userId);
    return this.create(dto, userId);
  }

  private async assertPeriodOpen(date: Date) {
    const locked = await this.prisma.periodLock.findFirst({
      where: {
        isLocked: true,
        deletedAt: null,
        dateFrom: { lte: date },
        dateTo: { gte: date },
      },
    });
    if (locked) throw new BadRequestException('Период закрыт. Редактирование запрещено.');
  }
}
