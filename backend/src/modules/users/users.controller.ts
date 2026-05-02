import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthUser } from '../auth/types';
import { UsersService } from './users.service';

@Roles(UserRole.ADMIN)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  create(
    @Body() body: { username: string; password: string; fullName: string; role: UserRole; isActive?: boolean },
    @CurrentUser() user?: AuthUser,
  ) {
    return this.usersService.create(body, user?.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: { username?: string; fullName?: string; role?: UserRole; isActive?: boolean }, @CurrentUser() user?: AuthUser) {
    return this.usersService.update(id, body, user?.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user?: AuthUser) {
    return this.usersService.remove(id, user?.id);
  }

  @Patch(':id/password')
  updatePassword(@Param('id') id: string, @Body() body: { password: string }, @CurrentUser() user?: AuthUser) {
    return this.usersService.updatePassword(id, body.password, user?.id);
  }

  @Patch(':id/activate')
  activate(@Param('id') id: string, @CurrentUser() user?: AuthUser) {
    return this.usersService.activate(id, user?.id);
  }

  @Patch(':id/deactivate')
  deactivate(@Param('id') id: string, @CurrentUser() user?: AuthUser) {
    return this.usersService.deactivate(id, user?.id);
  }
}
