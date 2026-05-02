import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
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
  create(@Param('name') name: never, @Body() body: Record<string, unknown>) {
    return this.directoriesService.create(name, body);
  }

  @Patch(':name/:id')
  update(@Param('name') name: never, @Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.directoriesService.update(name, id, body);
  }

  @Delete(':name/:id')
  remove(@Param('name') name: never, @Param('id') id: string) {
    return this.directoriesService.remove(name, id);
  }
}
