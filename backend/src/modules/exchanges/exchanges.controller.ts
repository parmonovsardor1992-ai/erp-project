import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthUser } from '../auth/types';
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
  create(@Body() dto: CreateExchangeDto, @CurrentUser() user?: AuthUser) {
    return this.exchangesService.create(dto, user?.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: CreateExchangeDto, @CurrentUser() user?: AuthUser) {
    return this.exchangesService.update(id, dto, user?.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user?: AuthUser) {
    return this.exchangesService.remove(id, user?.id);
  }
}
