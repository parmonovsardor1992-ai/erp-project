import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CounterpartiesService } from './counterparties.service';
import { CreateCounterpartyDto } from './dto/create-counterparty.dto';
import { UpdateCounterpartyDto } from './dto/update-counterparty.dto';

@Controller('counterparties')
export class CounterpartiesController {
  constructor(private readonly counterpartiesService: CounterpartiesService) {}

  @Get()
  findAll() {
    return this.counterpartiesService.findAll();
  }

  @Post()
  create(@Body() dto: CreateCounterpartyDto) {
    return this.counterpartiesService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCounterpartyDto) {
    return this.counterpartiesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.counterpartiesService.remove(id);
  }
}
