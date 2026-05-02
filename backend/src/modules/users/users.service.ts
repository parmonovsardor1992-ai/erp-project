import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { PasswordService } from '../auth/password.service';

type CreateUserPayload = {
  username: string;
  password: string;
  fullName: string;
  role: UserRole;
  isActive?: boolean;
};

type UpdateUserPayload = {
  username?: string;
  fullName?: string;
  role?: UserRole;
  isActive?: boolean;
};

@Injectable()
export class UsersService {
  private readonly userSelect = {
    id: true,
    username: true,
    fullName: true,
    role: true,
    isActive: true,
    createdAt: true,
    updatedAt: true,
    createdBy: true,
    updatedBy: true,
  };

  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
  ) {}

  findAll() {
    return this.prisma.user.findMany({
      where: { deletedAt: null },
      select: this.userSelect,
      orderBy: { username: 'asc' },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      select: this.userSelect,
    });
    if (!user) throw new NotFoundException('Пользователь не найден');
    return user;
  }

  async create(payload: CreateUserPayload, userId = 'system') {
    if (!payload.password || payload.password.length < 8) {
      throw new BadRequestException('Пароль должен быть не короче 8 символов');
    }

    return this.prisma.user.create({
      data: {
        username: payload.username,
        fullName: payload.fullName,
        name: payload.fullName,
        email: `${payload.username}@example.local`,
        role: payload.role,
        isActive: payload.isActive ?? true,
        passwordHash: this.passwordService.hash(payload.password),
        createdBy: userId,
      },
      select: this.userSelect,
    });
  }

  update(id: string, payload: UpdateUserPayload, userId = 'system') {
    return this.prisma.user.update({
      where: { id },
      data: {
        username: payload.username,
        fullName: payload.fullName,
        name: payload.fullName,
        role: payload.role,
        isActive: payload.isActive,
        updatedBy: userId,
      },
      select: this.userSelect,
    });
  }

  updatePassword(id: string, password: string, userId = 'system') {
    if (!password || password.length < 8) {
      throw new BadRequestException('Пароль должен быть не короче 8 символов');
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        passwordHash: this.passwordService.hash(password),
        updatedBy: userId,
      },
      select: this.userSelect,
    });
  }

  activate(id: string, userId = 'system') {
    return this.setActive(id, true, userId);
  }

  deactivate(id: string, userId = 'system') {
    return this.setActive(id, false, userId);
  }

  remove(id: string, userId = 'system') {
    return this.prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedBy: userId,
      },
      select: this.userSelect,
    });
  }

  private setActive(id: string, isActive: boolean, userId: string) {
    return this.prisma.user.update({
      where: { id },
      data: { isActive, updatedBy: userId },
      select: this.userSelect,
    });
  }
}
