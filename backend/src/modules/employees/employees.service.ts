import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class EmployeesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const where = {
      deletedAt: null,
      isActive: true,
      counterparty: {
        deletedAt: null,
      },
    };

    const employees = await this.prisma.employee.findMany({
      where,
      include: { counterparty: true, department: true },
      orderBy: { counterparty: { name: 'asc' } },
    });

    console.log(`[employees] count=${employees.length}; filter=${JSON.stringify({ deletedAt: null, isActive: true })}`);
    return employees;
  }
}
