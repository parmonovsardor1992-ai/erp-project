import { CurrencyCode } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsNumber, Min } from 'class-validator';

export class CreateRateDto {
  @IsEnum(CurrencyCode)
  code: CurrencyCode;

  @IsDateString()
  date: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  rateToUzs: number;
}
