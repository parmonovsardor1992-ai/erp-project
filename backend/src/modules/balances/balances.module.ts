import { Module } from '@nestjs/common';
import { RatesModule } from '../rates/rates.module';
import { BalancesController } from './balances.controller';
import { BalancesRepository } from './balances.repository';
import { BalancesService } from './balances.service';

@Module({
  imports: [RatesModule],
  controllers: [BalancesController],
  providers: [BalancesService, BalancesRepository],
  exports: [BalancesService],
})
export class BalancesModule {}
