import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthUser } from '../auth/types';
import { DirectoriesService } from './directories.service';

@Controller('directories')
export class DirectoriesController {
  constructor(private readonly directoriesService: DirectoriesService) {}

  @Get(':name')
  list(@Param('name') name: never, @Query('search') search?: string) {
    return this.directoriesService.list(name, search);
  }

  @Get(':name/:id')
  findOne(@Param('name') name: never, @Param('id') id: string) {
    return this.directoriesService.findOne(name, id);
  }

  @Post(':name')
  create(@Param('name') name: never, @Body() body: Record<string, unknown>, @CurrentUser() user?: AuthUser) {
    return this.directoriesService.create(name, body, user?.id);
  }

  @Patch(':name/:id')
  update(@Param('name') name: never, @Param('id') id: string, @Body() body: Record<string, unknown>, @CurrentUser() user?: AuthUser) {
    return this.directoriesService.update(name, id, body, user?.id);
  }

  @Delete(':name/:id')
  remove(@Param('name') name: never, @Param('id') id: string, @CurrentUser() user?: AuthUser) {
    return this.directoriesService.remove(name, id, user?.id);
  }
}
