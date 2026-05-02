import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateUtilityAccrualDto } from './dto/create-utility-accrual.dto';
import { UtilityAccrualsService } from './utility-accruals.service';

@Controller('utility-accruals')
export class UtilityAccrualsController {
  constructor(private readonly utilityAccrualsService: UtilityAccrualsService) {}

  @Get()
  findAll() {
    return this.utilityAccrualsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.utilityAccrualsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateUtilityAccrualDto) {
    return this.utilityAccrualsService.create(dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.utilityAccrualsService.remove(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: CreateUtilityAccrualDto) {
    return this.utilityAccrualsService.update(id, dto);
  }
}
