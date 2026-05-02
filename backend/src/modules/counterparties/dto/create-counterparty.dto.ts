import { CounterpartyType } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateCounterpartyDto {
  @IsString()
  name: string;

  @IsEnum(CounterpartyType)
  type: CounterpartyType;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  taxId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
