import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class SalaryRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.salaryRecord.findMany({
      include: { employee: true, department: true },
      orderBy: [{ period: 'desc' }, { employee: { name: 'asc' } }],
    });
  }

  findById(id: string) {
    return this.prisma.salaryRecord.findUniqueOrThrow({ where: { id } });
  }

  create(data: Prisma.SalaryRecordUncheckedCreateInput) {
    return this.prisma.salaryRecord.create({ data });
  }

  update(id: string, data: Prisma.SalaryRecordUncheckedUpdateInput) {
    return this.prisma.salaryRecord.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.salaryRecord.delete({ where: { id } });
  }
}
