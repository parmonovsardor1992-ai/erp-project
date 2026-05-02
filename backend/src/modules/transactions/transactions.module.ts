import { Module } from '@nestjs/common';
import { RatesModule } from '../rates/rates.module';
import { BankController, CardController, CashController, TransactionsController } from './transactions.controller';
import { TransactionsRepository } from './transactions.repository';
import { TransactionsService } from './transactions.service';

@Module({
  imports: [RatesModule],
  controllers: [TransactionsController, CashController, BankController, CardController],
  providers: [TransactionsService, TransactionsRepository],
})
export class TransactionsModule {}
