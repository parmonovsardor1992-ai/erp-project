import { Module } from '@nestjs/common';
import { RatesModule } from '../rates/rates.module';
import { UtilityAccrualsController } from './utility-accruals.controller';
import { UtilityAccrualsService } from './utility-accruals.service';

@Module({
  imports: [RatesModule],
  controllers: [UtilityAccrualsController],
  providers: [UtilityAccrualsService],
})
export class UtilityAccrualsModule {}
