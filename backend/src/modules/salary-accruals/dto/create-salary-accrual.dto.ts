import { CurrencyCode } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateSalaryAccrualDto {
  @IsDateString()
  date: string;

  @IsString()
  employeeId: string;

  @IsString()
  accrualMethod: string;

  @IsEnum(CurrencyCode)
  currencyCode: CurrencyCode;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amount: number;

  @IsOptional()
  @IsString()
  comment?: string;
}
