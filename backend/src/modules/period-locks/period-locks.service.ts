import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

type PeriodLockPayload = {
  dateFrom: string;
  dateTo: string;
  isLocked?: boolean;
};

@Injectable()
export class PeriodLocksService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.periodLock.findMany({
      where: { deletedAt: null },
      orderBy: { dateFrom: 'desc' },
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.periodLock.findFirst({ where: { id, deletedAt: null } });
    if (!item) {
      throw new NotFoundException('Период не найден');
    }
    return item;
  }

  create(payload: PeriodLockPayload, userId = 'system') {
    return this.prisma.periodLock.create({
      data: {
        dateFrom: new Date(payload.dateFrom),
        dateTo: new Date(payload.dateTo),
        isLocked: payload.isLocked ?? true,
        createdBy: userId,
      },
    });
  }

  update(id: string, payload: Partial<PeriodLockPayload>, userId = 'system') {
    return this.prisma.periodLock.update({
      where: { id },
      data: {
        dateFrom: payload.dateFrom ? new Date(payload.dateFrom) : undefined,
        dateTo: payload.dateTo ? new Date(payload.dateTo) : undefined,
        isLocked: payload.isLocked,
        updatedBy: userId,
      },
    });
  }

  remove(id: string, userId = 'system') {
    return this.prisma.periodLock.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedBy: userId,
      },
    });
  }
}
