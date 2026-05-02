import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CurrencyCode, Prisma } from '@prisma/client';
import { CreateRateDto } from './dto/create-rate.dto';
import { RatesRepository } from './rates.repository';

@Injectable()
export class RatesService {
  constructor(private readonly ratesRepository: RatesRepository) {}

  async findAll(code?: CurrencyCode) {
    return this.ratesRepository.findAll(code);
  }

  async create(dto: CreateRateDto) {
    const currency = await this.ratesRepository.upsertCurrency(dto.code);

    return this.ratesRepository.upsertRate(
      currency.id,
      dto.code,
      new Date(dto.date),
      new Prisma.Decimal(dto.rateToUzs),
    );
  }

  async getRateByDate(code: CurrencyCode, date: Date): Promise<Prisma.Decimal> {
    if (code === CurrencyCode.UZS) {
      return new Prisma.Decimal(1);
    }

    const rate = await this.ratesRepository.findLatestRate(code, date);

    if (!rate) {
      throw new NotFoundException(`Курс ${code} на дату ${date.toISOString().slice(0, 10)} не найден. Добавьте курс в справочнике курсов валют.`);
    }

    if (rate.rateToUzs.lte(0)) {
      throw new BadRequestException('Курс валюты должен быть больше нуля.');
    }

    return rate.rateToUzs;
  }

  async remove(id: string) {
    return this.ratesRepository.remove(id);
  }
}
