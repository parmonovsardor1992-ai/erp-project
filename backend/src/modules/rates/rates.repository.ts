import { Injectable } from '@nestjs/common';
import { CurrencyCode, Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class RatesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(code?: CurrencyCode) {
    return this.prisma.currencyRate.findMany({
      where: { code, deletedAt: null },
      orderBy: [{ date: 'desc' }, { code: 'asc' }],
    });
  }

  upsertCurrency(code: CurrencyCode) {
    return this.prisma.currency.upsert({
      where: { code },
      update: { deletedAt: null, updatedBy: 'system' },
      create: { code, name: code, createdBy: 'system' },
    });
  }

  upsertRate(currencyId: string, code: CurrencyCode, date: Date, rateToUzs: Prisma.Decimal) {
    return this.prisma.currencyRate.upsert({
      where: { code_date: { code, date } },
      update: { rateToUzs, updatedBy: 'system' },
      create: { currencyId, code, date, rateToUzs, createdBy: 'system' },
    });
  }

  findLatestRate(code: CurrencyCode, date: Date) {
    return this.prisma.currencyRate.findFirst({
      where: { code, date: { lte: date }, deletedAt: null },
      orderBy: { date: 'desc' },
    });
  }

  remove(id: string) {
    return this.prisma.currencyRate.update({ where: { id }, data: { deletedAt: new Date(), updatedBy: 'system' } });
  }
}
