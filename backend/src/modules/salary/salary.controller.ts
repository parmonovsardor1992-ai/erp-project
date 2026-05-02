import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CreateSalaryRecordDto } from './dto/create-salary-record.dto';
import { UpdateSalaryRecordDto } from './dto/update-salary-record.dto';
import { SalaryService } from './salary.service';

@Controller('salary')
export class SalaryController {
  constructor(private readonly salaryService: SalaryService) {}

  @Get()
  findAll(@Query('period') period?: string, @Query('employeeId') employeeId?: string) {
    return this.salaryService.findAll(period, employeeId);
  }

  @Post()
  create(@Body() dto: CreateSalaryRecordDto) {
    return this.salaryService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSalaryRecordDto) {
    return this.salaryService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.salaryService.remove(id);
  }
}
