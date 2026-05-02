import { Injectable } from '@nestjs/common';
import { CurrencyCode, Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class RatesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(code?: CurrencyCode) {
    return this.prisma.currencyRate.findMany({
      where: code ? { code } : undefined,
      orderBy: [{ date: 'desc' }, { code: 'asc' }],
    });
  }

  upsertCurrency(code: CurrencyCode) {
    return this.prisma.currency.upsert({
      where: { code },
      update: {},
      create: { code, name: code },
    });
  }

  upsertRate(currencyId: string, code: CurrencyCode, date: Date, rateToUzs: Prisma.Decimal) {
    return this.prisma.currencyRate.upsert({
      where: { code_date: { code, date } },
      update: { rateToUzs },
      create: { currencyId, code, date, rateToUzs },
    });
  }

  findLatestRate(code: CurrencyCode, date: Date) {
    return this.prisma.currencyRate.findFirst({
      where: { code, date: { lte: date } },
      orderBy: { date: 'desc' },
    });
  }

  remove(id: string) {
    return this.prisma.currencyRate.delete({ where: { id } });
  }
}
