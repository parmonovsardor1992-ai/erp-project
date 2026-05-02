import { Module } from '@nestjs/common';
import { RatesModule } from '../rates/rates.module';
import { OtherCounterpartiesController } from './other-counterparties.controller';
import { OtherCounterpartiesService } from './other-counterparties.service';

@Module({
  imports: [RatesModule],
  controllers: [OtherCounterpartiesController],
  providers: [OtherCounterpartiesService],
})
export class OtherCounterpartiesModule {}
