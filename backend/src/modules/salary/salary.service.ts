import { Injectable } from '@nestjs/common';
import { Prisma, TransactionType } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateSalaryRecordDto } from './dto/create-salary-record.dto';
import { UpdateSalaryRecordDto } from './dto/update-salary-record.dto';
import { SalaryRepository } from './salary.repository';

@Injectable()
export class SalaryService {
  constructor(
    private readonly salaryRepository: SalaryRepository,
    private readonly prisma: PrismaService,
  ) {}

  async findAll(period?: string, employeeId?: string) {
    const start = period ? new Date(period) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);

    const employees = await this.prisma.employee.findMany({
      where: employeeId ? { id: employeeId } : undefined,
      include: { counterparty: true, department: true },
      orderBy: { counterparty: { name: 'asc' } },
    });

    return Promise.all(employees.map(async (employee) => {
      const [accrued, paid] = await Promise.all([
        this.prisma.salaryAccrual.aggregate({
          where: { employeeId: employee.id, date: { gte: start, lt: end } },
          _sum: { amountUzs: true },
        }),
        this.prisma.transaction.aggregate({
          where: {
            counterpartyId: employee.counterpartyId,
            type: TransactionType.EXPENSE,
            date: { gte: start, lt: end },
            movementType: { name: { in: ['Сотрудники', 'Зарплата'] } },
          },
          _sum: { totalUzs: true },
        }),
      ]);
      const openingBalance = 0;
      const accruedValue = Number(accrued._sum.amountUzs ?? 0);
      const paidValue = Number(paid._sum.totalUzs ?? 0);

      return {
        period: start,
        employee: employee.counterparty,
        position: employee.position,
        department: employee.department,
        openingBalance,
        accrued: accruedValue,
        paid: paidValue,
        closingBalance: openingBalance + accruedValue - paidValue,
      };
    }));
  }

  create(dto: CreateSalaryRecordDto) {
    const totals = this.calculate(dto);
    return this.salaryRepository.create({
      employeeId: dto.employeeId,
      position: dto.position,
      departmentId: dto.departmentId,
      period: new Date(dto.period),
      ...totals,
      comment: dto.comment,
    });
  }

  async update(id: string, dto: UpdateSalaryRecordDto) {
    const current = await this.salaryRepository.findById(id);
    const totals = this.calculate({
      startBalance: dto.startBalance ?? current.startBalance.toNumber(),
      accrued: dto.accrued ?? current.accrued.toNumber(),
      paid: dto.paid ?? current.paid.toNumber(),
    });

    return this.salaryRepository.update(id, {
      employeeId: dto.employeeId,
      position: dto.position,
      departmentId: dto.departmentId,
      period: dto.period ? new Date(dto.period) : undefined,
      ...totals,
      comment: dto.comment,
    });
  }

  remove(id: string) {
    return this.salaryRepository.remove(id);
  }

  private calculate(dto: Pick<CreateSalaryRecordDto, 'startBalance' | 'accrued' | 'paid'>) {
    const start = new Prisma.Decimal(dto.startBalance);
    const accrued = new Prisma.Decimal(dto.accrued);
    const paid = new Prisma.Decimal(dto.paid);

    return {
      startBalance: start,
      accrued,
      paid,
      finalBalance: start.plus(accrued).minus(paid),
    };
  }
}

