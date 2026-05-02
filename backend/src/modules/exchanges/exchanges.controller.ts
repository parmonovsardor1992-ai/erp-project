import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateExchangeDto } from './dto/create-exchange.dto';
import { ExchangesService } from './exchanges.service';

@Controller('exchanges')
export class ExchangesController {
  constructor(private readonly exchangesService: ExchangesService) {}

  @Get()
  findAll() {
    return this.exchangesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.exchangesService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateExchangeDto) {
    return this.exchangesService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: CreateExchangeDto) {
    return this.exchangesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.exchangesService.remove(id);
  }
}
