import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateSalaryAccrualDto } from './dto/create-salary-accrual.dto';
import { SalaryAccrualsService } from './salary-accruals.service';

@Controller('salary-accruals')
export class SalaryAccrualsController {
  constructor(private readonly salaryAccrualsService: SalaryAccrualsService) {}

  @Get()
  findAll() {
    return this.salaryAccrualsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.salaryAccrualsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateSalaryAccrualDto) {
    return this.salaryAccrualsService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: CreateSalaryAccrualDto) {
    return this.salaryAccrualsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.salaryAccrualsService.remove(id);
  }
}
