import { Module } from '@nestjs/common';
import { CounterpartiesController } from './counterparties.controller';
import { CounterpartiesRepository } from './counterparties.repository';
import { CounterpartiesService } from './counterparties.service';

@Module({
  controllers: [CounterpartiesController],
  providers: [CounterpartiesService, CounterpartiesRepository],
})
export class CounterpartiesModule {}
