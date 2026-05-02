import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { MockAuthGuard } from './common/guards/mock-auth.guard';
import { PrismaModule } from './common/prisma/prisma.module';
import { BalancesModule } from './modules/balances/balances.module';
import { CounterpartiesModule } from './modules/counterparties/counterparties.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { DictionariesModule } from './modules/dictionaries/dictionaries.module';
import { DirectoriesModule } from './modules/directories/directories.module';
import { ExchangesModule } from './modules/exchanges/exchanges.module';
import { OrdersModule } from './modules/orders/orders.module';
import { OtherCounterpartiesModule } from './modules/other-counterparties/other-counterparties.module';
import { RatesModule } from './modules/rates/rates.module';
import { SalaryModule } from './modules/salary/salary.module';
import { SalaryAccrualsModule } from './modules/salary-accruals/salary-accruals.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { UtilityAccrualsModule } from './modules/utility-accruals/utility-accruals.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    RatesModule,
    TransactionsModule,
    OrdersModule,
    BalancesModule,
    CounterpartiesModule,
    SalaryModule,
    SalaryAccrualsModule,
    DictionariesModule,
    DirectoriesModule,
    ExchangesModule,
    UtilityAccrualsModule,
    OtherCounterpartiesModule,
    DashboardModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: MockAuthGuard }],
})
export class AppModule {}
