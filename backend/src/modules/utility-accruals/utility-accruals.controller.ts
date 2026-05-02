import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthUser } from '../auth/types';
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
  create(@Body() dto: CreateUtilityAccrualDto, @CurrentUser() user?: AuthUser) {
    return this.utilityAccrualsService.create(dto, user?.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user?: AuthUser) {
    return this.utilityAccrualsService.remove(id, user?.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: CreateUtilityAccrualDto, @CurrentUser() user?: AuthUser) {
    return this.utilityAccrualsService.update(id, dto, user?.id);
  }
}
