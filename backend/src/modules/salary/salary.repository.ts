import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class SalaryRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.salaryRecord.findMany({
      where: { deletedAt: null },
      include: { employee: true, department: true },
      orderBy: [{ period: 'desc' }, { employee: { name: 'asc' } }],
    });
  }

  findById(id: string) {
    return this.prisma.salaryRecord.findFirstOrThrow({ where: { id, deletedAt: null } });
  }

  create(data: Prisma.SalaryRecordUncheckedCreateInput) {
    return this.prisma.salaryRecord.create({ data: { ...data, createdBy: 'system' } });
  }

  update(id: string, data: Prisma.SalaryRecordUncheckedUpdateInput) {
    return this.prisma.salaryRecord.update({ where: { id }, data: { ...data, updatedBy: 'system' } });
  }

  remove(id: string) {
    return this.prisma.salaryRecord.update({ where: { id }, data: { deletedAt: new Date(), updatedBy: 'system' } });
  }
}
