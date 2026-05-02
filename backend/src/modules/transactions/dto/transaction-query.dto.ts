import { CashAccountType, TransactionType } from '@prisma/client';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class TransactionQueryDto extends PaginationDto {
  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @IsOptional()
  @IsString()
  cashAccountId?: string;

  @IsOptional()
  @IsEnum(CashAccountType)
  accountType?: CashAccountType;

  @IsOptional()
  @IsString()
  counterpartyId?: string;

  @IsOptional()
  @IsString()
  movementTypeId?: string;
}
