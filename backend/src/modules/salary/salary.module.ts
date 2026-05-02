import { Module } from '@nestjs/common';
import { SalaryController } from './salary.controller';
import { SalaryRepository } from './salary.repository';
import { SalaryService } from './salary.service';

@Module({
  controllers: [SalaryController],
  providers: [SalaryService, SalaryRepository],
})
export class SalaryModule {}
