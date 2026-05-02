import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './common/prisma/prisma.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from './modules/auth/guards/roles.guard';
import { AuthModule } from './modules/auth/auth.module';
import { BalancesModule } from './modules/balances/balances.module';
import { CounterpartiesModule } from './modules/counterparties/counterparties.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { DictionariesModule } from './modules/dictionaries/dictionaries.module';
import { DirectoriesModule } from './modules/directories/directories.module';
import { ExchangesModule } from './modules/exchanges/exchanges.module';
import { OrdersModule } from './modules/orders/orders.module';
import { OtherCounterpartiesModule } from './modules/other-counterparties/other-counterparties.module';
import { PeriodLocksModule } from './modules/period-locks/period-locks.module';
import { RatesModule } from './modules/rates/rates.module';
import { SalaryModule } from './modules/salary/salary.module';
import { SalaryAccrualsModule } from './modules/salary-accruals/salary-accruals.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { UtilityAccrualsModule } from './modules/utility-accruals/utility-accruals.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
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
    PeriodLocksModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
