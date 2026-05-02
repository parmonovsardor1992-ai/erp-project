import { BadRequestException, Injectable } from '@nestjs/common';
import { CurrencyCode, Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RatesService } from '../rates/rates.service';
import { CreateSalaryAccrualDto } from './dto/create-salary-accrual.dto';

@Injectable()
export class SalaryAccrualsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ratesService: RatesService,
  ) {}

  findAll() {
    return this.prisma.salaryAccrual.findMany({
      where: { deletedAt: null },
      include: { employee: { include: { counterparty: true, department: true } }, counterparty: true, department: true },
      orderBy: { date: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.salaryAccrual.findFirstOrThrow({
      where: { id, deletedAt: null },
      include: { employee: { include: { counterparty: true, department: true } }, counterparty: true, department: true },
    });
  }

  async create(dto: CreateSalaryAccrualDto, userId = 'system') {
    const employee = await this.prisma.employee.findUniqueOrThrow({
      where: { id: dto.employeeId },
      include: { counterparty: true, department: true },
    });
    const date = new Date(dto.date);
    await this.assertPeriodOpen(date);
    const rate = await this.ratesService.getRateByDate(CurrencyCode.USD, date);
    const amount = new Prisma.Decimal(dto.amount);
    const amountUzs = dto.currencyCode === CurrencyCode.UZS ? amount : amount.mul(rate);
    const amountUsd = dto.currencyCode === CurrencyCode.USD ? amount : amount.div(rate);

    return this.prisma.salaryAccrual.create({
      data: {
        date,
        employeeId: employee.id,
        counterpartyId: employee.counterpartyId,
        position: employee.position,
        departmentId: employee.departmentId,
        accrualMethod: dto.accrualMethod,
        currencyCode: dto.currencyCode,
        amount,
        rate,
        amountUzs,
        amountUsd,
        comment: dto.comment,
        createdBy: userId,
      },
      include: { employee: { include: { counterparty: true, department: true } }, counterparty: true, department: true },
    });
  }

  async update(id: string, dto: CreateSalaryAccrualDto, userId = 'system') {
    const current = await this.findOne(id);
    await this.assertPeriodOpen(current.date);
    await this.prisma.salaryAccrual.update({ where: { id }, data: { deletedAt: new Date(), updatedBy: userId } });
    return this.create(dto, userId);
  }

  async remove(id: string, userId = 'system') {
    const current = await this.findOne(id);
    await this.assertPeriodOpen(current.date);
    return this.prisma.salaryAccrual.update({ where: { id }, data: { deletedAt: new Date(), updatedBy: userId } });
  }

  private async assertPeriodOpen(date: Date) {
    const locked = await this.prisma.periodLock.findFirst({
      where: {
        isLocked: true,
        deletedAt: null,
        dateFrom: { lte: date },
        dateTo: { gte: date },
      },
    });
    if (locked) throw new BadRequestException('Период закрыт. Редактирование запрещено.');
  }
}
