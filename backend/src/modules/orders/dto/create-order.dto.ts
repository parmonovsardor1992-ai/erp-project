import { CurrencyCode, OrderStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  number: string;

  @IsString()
  counterpartyId: string;

  @IsOptional()
  @IsString()
  structure?: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsEnum(CurrencyCode)
  currencyCode?: CurrencyCode;

  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amountUzs = 0;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amountUsd = 0;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  totalAmount = 0;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  structureAmount = 0;
}
