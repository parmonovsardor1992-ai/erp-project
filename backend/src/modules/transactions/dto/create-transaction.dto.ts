import { TransactionType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateTransactionDto {
  @IsDateString()
  date: string;

  @IsEnum(TransactionType)
  type: TransactionType;

  @IsString()
  cashAccountId: string;

  @IsOptional()
  @IsString()
  movementTypeId?: string;

  @IsOptional()
  @IsString()
  exchangeAccountId?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  expenseArticleId?: string;

  @IsOptional()
  @IsString()
  counterpartyId?: string;

  @IsOptional()
  @IsString()
  orderId?: string;

  @IsOptional()
  @IsString()
  orderStructure?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  comment?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amountUzs = 0;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amountUsd = 0;
}
