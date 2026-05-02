import { Controller, Get, Query } from '@nestjs/common';
import { CashAccountType } from '@prisma/client';
import { BalancesService } from './balances.service';

@Controller('balances')
export class BalancesController {
  constructor(private readonly balancesService: BalancesService) {}

  @Get()
  findAll() {
    return this.balancesService.findAll();
  }

  @Get('points')
  byPoint() {
    return this.balancesService.byPoint();
  }

  @Get('report')
  report(@Query('from') from?: string, @Query('to') to?: string, @Query('accountType') accountType?: CashAccountType) {
    return this.balancesService.report(from, to, accountType);
  }

  @Get('income-vs-expense')
  incomeVsExpense() {
    return this.balancesService.incomeVsExpense();
  }
}
