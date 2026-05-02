import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { CurrencyCode } from '@prisma/client';
import { CreateRateDto } from './dto/create-rate.dto';
import { RatesService } from './rates.service';

@Controller('rates')
export class RatesController {
  constructor(private readonly ratesService: RatesService) {}

  @Get()
  findAll(@Query('code') code?: CurrencyCode) {
    return this.ratesService.findAll(code);
  }

  @Post()
  create(@Body() dto: CreateRateDto) {
    return this.ratesService.create(dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ratesService.remove(id);
  }
}

@Controller('currency-rates')
export class CurrencyRatesController {
  constructor(private readonly ratesService: RatesService) {}

  @Get()
  findAll(@Query('code') code?: CurrencyCode) {
    return this.ratesService.findAll(code);
  }

  @Post()
  create(@Body() dto: CreateRateDto) {
    return this.ratesService.create(dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ratesService.remove(id);
  }
}
