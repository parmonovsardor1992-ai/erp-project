import { Module } from '@nestjs/common';
import { RatesModule } from '../rates/rates.module';
import { ExchangesController } from './exchanges.controller';
import { ExchangesService } from './exchanges.service';

@Module({
  imports: [RatesModule],
  controllers: [ExchangesController],
  providers: [ExchangesService],
  exports: [ExchangesService],
})
export class ExchangesModule {}
