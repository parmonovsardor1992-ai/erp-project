import { Module } from '@nestjs/common';
import { CurrencyRatesController, RatesController } from './rates.controller';
import { RatesRepository } from './rates.repository';
import { RatesService } from './rates.service';

@Module({
  controllers: [RatesController, CurrencyRatesController],
  providers: [RatesService, RatesRepository],
  exports: [RatesService],
})
export class RatesModule {}
