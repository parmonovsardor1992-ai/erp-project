import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthUser } from '../auth/types';
import { PeriodLocksService } from './period-locks.service';

@Controller('period-locks')
export class PeriodLocksController {
  constructor(private readonly periodLocksService: PeriodLocksService) {}

  @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
  @Get()
  findAll() {
    return this.periodLocksService.findAll();
  }

  @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.periodLocksService.findOne(id);
  }

  @Roles(UserRole.ADMIN)
  @Post()
  create(@Body() body: { dateFrom: string; dateTo: string; isLocked?: boolean }, @CurrentUser() user?: AuthUser) {
    return this.periodLocksService.create(body, user?.id);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: { dateFrom?: string; dateTo?: string; isLocked?: boolean }, @CurrentUser() user?: AuthUser) {
    return this.periodLocksService.update(id, body, user?.id);
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user?: AuthUser) {
    return this.periodLocksService.remove(id, user?.id);
  }
}
