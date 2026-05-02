import { Controller, Get, Query } from '@nestjs/common';
import { CurrencyCode } from '@prisma/client';
import { OtherCounterpartiesService } from './other-counterparties.service';

@Controller('other-counterparties')
export class OtherCounterpartiesController {
  constructor(private readonly otherCounterpartiesService: OtherCounterpartiesService) {}

  @Get()
  report(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('counterpartyId') counterpartyId?: string,
    @Query('currency') currency?: CurrencyCode,
  ) {
    return this.otherCounterpartiesService.report(from, to, counterpartyId, currency);
  }
}
