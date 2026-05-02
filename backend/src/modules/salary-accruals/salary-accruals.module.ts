import { Module } from '@nestjs/common';
import { RatesModule } from '../rates/rates.module';
import { SalaryAccrualsController } from './salary-accruals.controller';
import { SalaryAccrualsService } from './salary-accruals.service';

@Module({
  imports: [RatesModule],
  controllers: [SalaryAccrualsController],
  providers: [SalaryAccrualsService],
})
export class SalaryAccrualsModule {}
