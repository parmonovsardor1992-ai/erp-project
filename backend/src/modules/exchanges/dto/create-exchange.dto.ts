import { CurrencyCode } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateExchangeDto {
  @IsDateString()
  date: string;

  @IsString()
  fromAccountId: string;

  @IsString()
  toAccountId: string;

  @IsEnum(CurrencyCode)
  currencyFrom: CurrencyCode;

  @IsEnum(CurrencyCode)
  currencyTo: CurrencyCode;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amountFrom: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amountTo?: number;

  @IsOptional()
  @IsString()
  comment?: string;
}
