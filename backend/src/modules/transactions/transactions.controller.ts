import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CashAccountType } from '@prisma/client';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionQueryDto } from './dto/transaction-query.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  findAll(@Query() query: TransactionQueryDto) {
    return this.transactionsService.findAll(query);
  }

  @Post()
  create(@Body() dto: CreateTransactionDto) {
    return this.transactionsService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTransactionDto) {
    return this.transactionsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.transactionsService.remove(id);
  }
}

@Controller('cash')
export class CashController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  findAll(@Query() query: TransactionQueryDto) {
    return this.transactionsService.findAll({ ...query, accountType: CashAccountType.CASH });
  }
}

@Controller('bank')
export class BankController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  findAll(@Query() query: TransactionQueryDto) {
    return this.transactionsService.findAll({ ...query, accountType: CashAccountType.BANK });
  }
}

@Controller('card')
export class CardController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  findAll(@Query() query: TransactionQueryDto) {
    return this.transactionsService.findAll({ ...query, accountType: CashAccountType.CARD });
  }
}
