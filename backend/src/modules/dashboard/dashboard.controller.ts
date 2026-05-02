import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  summary(@Query('from') from?: string, @Query('to') to?: string) {
    return this.dashboardService.summary(from, to);
  }
}
