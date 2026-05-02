import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthUser } from '../auth/types';
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
  create(@Body() dto: CreateSalaryAccrualDto, @CurrentUser() user?: AuthUser) {
    return this.salaryAccrualsService.create(dto, user?.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: CreateSalaryAccrualDto, @CurrentUser() user?: AuthUser) {
    return this.salaryAccrualsService.update(id, dto, user?.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user?: AuthUser) {
    return this.salaryAccrualsService.remove(id, user?.id);
  }
}
