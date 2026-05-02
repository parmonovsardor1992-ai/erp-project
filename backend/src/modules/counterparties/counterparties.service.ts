import { Injectable } from '@nestjs/common';
import { CounterpartiesRepository } from './counterparties.repository';
import { CreateCounterpartyDto } from './dto/create-counterparty.dto';
import { UpdateCounterpartyDto } from './dto/update-counterparty.dto';

@Injectable()
export class CounterpartiesService {
  constructor(private readonly counterpartiesRepository: CounterpartiesRepository) {}

  async findAll() {
    const counterparties = await this.counterpartiesRepository.findAllWithAccruals();

    return counterparties.map((item) => {
      const debt = item.expenseAccruals.reduce(
        (sum, accrual) => sum + accrual.accruedUzs.toNumber() - accrual.paidUzs.toNumber(),
        0,
      );

      return { ...item, debtUzs: debt };
    });
  }

  create(dto: CreateCounterpartyDto) {
    return this.counterpartiesRepository.create(dto);
  }

  update(id: string, dto: UpdateCounterpartyDto) {
    return this.counterpartiesRepository.update(id, dto);
  }

  remove(id: string) {
    return this.counterpartiesRepository.remove(id);
  }
}
