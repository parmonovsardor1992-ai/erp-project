import { PartialType } from '@nestjs/mapped-types';
import { CreateSalaryRecordDto } from './create-salary-record.dto';

export class UpdateSalaryRecordDto extends PartialType(CreateSalaryRecordDto) {}
