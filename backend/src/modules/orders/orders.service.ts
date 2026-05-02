import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrdersRepository } from './orders.repository';

@Injectable()
export class OrdersService {
  constructor(
    private readonly ordersRepository: OrdersRepository,
    private readonly prisma: PrismaService,
  ) {}

  async findAll(validOnly = true, filters?: { customerId?: string; dateFrom?: string; dateTo?: string; search?: string }) {
    const orders = await this.ordersRepository.findAll(validOnly, filters);
    return orders.map((order) => this.withPaymentInfo(order));
  }

  async findOne(id: string) {
    return this.withPaymentInfo(await this.ordersRepository.findById(id));
  }

  async create(dto: CreateOrderDto) {
    const startDate = new Date(dto.startDate);
    const setting = await this.prisma.setting.findUnique({ where: { key: 'averageOrderLengthDays' } });
    const averageDays = Number(setting?.value ?? 40);
    const endDate = dto.endDate ? new Date(dto.endDate) : new Date(startDate.getTime() + averageDays * 24 * 60 * 60 * 1000);

    return this.ordersRepository.create({
      number: dto.number,
      counterpartyId: dto.counterpartyId,
      name: dto.name,
      structure: dto.structure,
      currencyCode: dto.currencyCode,
      status: dto.status,
      startDate,
      endDate,
      amountUzs: dto.amountUzs,
      amountUsd: dto.amountUsd,
      totalAmount: dto.totalAmount,
      structureAmount: dto.structureAmount,
    });
  }

  update(id: string, dto: UpdateOrderDto) {
    return this.ordersRepository.update(id, this.toUpdateData(dto));
  }

  remove(id: string) {
    return this.ordersRepository.remove(id);
  }

  private toUpdateData(dto: UpdateOrderDto): Prisma.OrderUncheckedUpdateInput {
    return {
      number: dto.number,
      counterpartyId: dto.counterpartyId,
      name: dto.name,
      structure: dto.structure,
      currencyCode: dto.currencyCode,
      status: dto.status,
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      amountUzs: dto.amountUzs,
      amountUsd: dto.amountUsd,
      totalAmount: dto.totalAmount,
      structureAmount: dto.structureAmount,
    };
  }

  private withPaymentInfo(order: Awaited<ReturnType<OrdersRepository['findById']>>) {
    const paidUzs = order.transactions.reduce((sum, row) => sum + row.totalUzs.toNumber(), 0);
    const paidUsd = order.transactions.reduce((sum, row) => sum + row.totalUsd.toNumber(), 0);
    const paidAmount = order.currencyCode === 'USD' ? paidUsd : paidUzs;
    const orderDebt = order.structureAmount.toNumber() - paidAmount;

    return {
      ...order,
      paidAmount,
      orderDebt,
    };
  }
}
