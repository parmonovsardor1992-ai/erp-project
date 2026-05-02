import { Type } from 'class-transformer';
import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateSalaryRecordDto {
  @IsString()
  employeeId: string;

  @IsOptional()
  @IsString()
  position?: string;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsDateString()
  period: string;

  @Type(() => Number)
  @IsNumber()
  startBalance = 0;

  @Type(() => Number)
  @IsNumber()
  accrued = 0;

  @Type(() => Number)
  @IsNumber()
  paid = 0;

  @IsOptional()
  @IsString()
  comment?: string;
}
