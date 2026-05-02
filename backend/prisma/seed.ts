import {
  CashAccountType,
  CategoryType,
  CounterpartyType,
  CurrencyCode,
  PrismaClient,
  TransactionType,
  UserRole,
} from '@prisma/client';
import { scryptSync } from 'crypto';

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  const salt = 'erp-admin-seed-salt';
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `scrypt:${salt}:${hash}`;
}

async function upsertCounterparty(name: string, type: CounterpartyType) {
  return prisma.counterparty.upsert({
    where: { name_type: { name, type } },
    update: {},
    create: { name, type },
  });
}

async function main() {
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {
      fullName: 'Администратор',
      role: UserRole.ADMIN,
      isActive: true,
      deletedAt: null,
    },
    create: {
      username: 'admin',
      email: 'admin@example.local',
      name: 'Администратор',
      fullName: 'Администратор',
      passwordHash: hashPassword('Admin123456!'),
      role: UserRole.ADMIN,
      isActive: true,
      createdBy: 'system',
    },
  });

  await prisma.currency.upsert({
    where: { code: CurrencyCode.UZS },
    update: { name: 'UZS' },
    create: { code: CurrencyCode.UZS, name: 'UZS' },
  });
  const usd = await prisma.currency.upsert({
    where: { code: CurrencyCode.USD },
    update: { name: 'USD' },
    create: { code: CurrencyCode.USD, name: 'USD' },
  });
  await prisma.currencyRate.upsert({
    where: { code_date: { code: CurrencyCode.USD, date: new Date('2026-05-01') } },
    update: { rateToUzs: 12600 },
    create: { currencyId: usd.id, code: CurrencyCode.USD, date: new Date('2026-05-01'), rateToUzs: 12600 },
  });

  for (const account of [
    { name: 'Касса', type: CashAccountType.CASH },
    { name: 'Банк', type: CashAccountType.BANK },
    { name: 'Карта', type: CashAccountType.CARD },
  ]) {
    await prisma.cashAccount.upsert({
      where: { name: account.name },
      update: { type: account.type, currencyCode: CurrencyCode.UZS, isActive: true },
      create: { ...account, currencyCode: CurrencyCode.UZS },
    });
  }

  for (const item of [
    { code: TransactionType.INCOME, name: 'Приход' },
    { code: TransactionType.EXPENSE, name: 'Расход' },
    { code: TransactionType.EXCHANGE, name: 'Обмен' },
  ]) {
    await prisma.paymentType.upsert({ where: { code: item.code }, update: { name: item.name }, create: item });
  }

  const movementNames: Record<TransactionType, string[]> = {
    INCOME: ['Покупатели', 'Снабжение', 'Перекидка', 'Сотрудники', 'Аренда.Коммуналка', 'Оборотный Капитал'],
    EXPENSE: ['Покупатели', 'Снабжение', 'Перекидка', 'Сотрудники', 'Зарплата', 'Аренда.Коммуналка', 'Оборотный Капитал', 'Нал.Расходы', 'Снятие.Прибыли', 'Новое Оборудование'],
    EXCHANGE: ['UZS.Приход', 'USD.Приход'],
  };
  for (const [paymentType, names] of Object.entries(movementNames) as Array<[TransactionType, string[]]>) {
    for (const name of names) {
      await prisma.movementType.upsert({
        where: { name_paymentType: { name, paymentType } },
        update: {},
        create: { name, paymentType },
      });
    }
  }

  for (const name of ['Uztelecom', 'BYD Astana', 'Tenge', 'Krystal group', 'A Group Imagine', 'Ho UZ', 'Hyper Partners', 'Эльер кухня', 'Межрибоону квартира']) {
    await upsertCounterparty(name, CounterpartyType.CUSTOMER);
  }

  for (const name of ['BLUM', 'Крафтбуд', 'ЭМАН', 'GTV', 'Гайрат', 'ALKAN', 'Hettich', 'Clop', 'Messan', '1000 мелочей', 'Mobaks', 'Фатхулла Бутик', 'Бохадир ака ойна', 'ARDO', 'BRRAUF', 'Одил услуга', 'Металл сити', 'ДВТТ Жоми бозор', 'АККОРА', 'Dussel', 'Betek', 'A Marka']) {
    await upsertCounterparty(name, CounterpartyType.SUPPLIER);
  }

  const departments = await Promise.all(
    ['АУП', 'Производство'].map((name) => prisma.department.upsert({ where: { name }, update: {}, create: { name } })),
  );

  for (const [index, name] of ['Алиев Алишер', 'Каримова Мадина', 'Рахимов Бекзод'].entries()) {
    const counterparty = await upsertCounterparty(name, CounterpartyType.EMPLOYEE);
    await prisma.employee.upsert({
      where: { counterpartyId: counterparty.id },
      update: { position: index === 0 ? 'Директор' : 'Сотрудник', departmentId: departments[index % departments.length].id },
      create: {
        counterpartyId: counterparty.id,
        position: index === 0 ? 'Директор' : 'Сотрудник',
        departmentId: departments[index % departments.length].id,
      },
    });
  }

  for (const name of ['Шкаф', 'Стеллаж', 'Двери', 'Кухня', 'Обшивка стеновая', 'Комплект домашней мебели', 'Комплект офисной мебели', 'Учебный центр', 'ресепшн']) {
    await prisma.product.upsert({ where: { name }, update: {}, create: { name, unit: 'шт' } });
  }

  for (const category of [
    { name: 'Продажи', type: CategoryType.INCOME },
    { name: 'Сырье и материалы', type: CategoryType.EXPENSE },
    { name: 'Аренда', type: CategoryType.EXPENSE },
    { name: 'Коммуналка', type: CategoryType.EXPENSE },
    { name: 'Зарплата', type: CategoryType.EXPENSE },
    { name: 'Прочие расходы', type: CategoryType.EXPENSE },
  ]) {
    await prisma.category.upsert({
      where: { name_type: { name: category.name, type: category.type } },
      update: {},
      create: category,
    });
  }

  for (const item of [
    ['Транспорт', 'Себ-ть', 'GENERAL', null],
    ['Бензин', 'Себ-ть', 'GENERAL', null],
    ['Ремонт обор-е', 'Себ-ть', 'GENERAL', null],
    ['Офисные расходы', 'Операционные расходы', 'GENERAL', null],
    ['% обналички', 'Финансовые расходы', 'GENERAL', null],
    ['Питание', 'Себ-ть', 'GENERAL', null],
    ['Банковские расходы', 'Операционные расходы', 'GENERAL', null],
    ['Налоги ЗП', 'Налоги', 'GENERAL', null],
    ['НДС и прочие налоги', 'Налоги', 'GENERAL', null],
    ['Прочие расходы', 'Операционные расходы', 'GENERAL', null],
    ['Курсовая разница', 'Финансовые расходы', 'GENERAL', null],
    ['Материал', 'Себ-ть', 'SUPPLY', null],
    ['Фурнитура', 'Себ-ть', 'SUPPLY', null],
    ['Метал', 'Себ-ть', 'SUPPLY', null],
    ['Услуга', 'Себ-ть', 'SUPPLY', null],
    ['Питание', 'Себ-ть', 'SUPPLY', null],
    ['Транспорт', 'Себ-ть', 'SUPPLY', null],
    ['Бензин', 'Себ-ть', 'SUPPLY', null],
    ['Аренда Нал', 'Аренда/Коммуналка', 'UTILITY', CurrencyCode.USD],
    ['Аренда Бух', 'Аренда/Коммуналка', 'UTILITY', CurrencyCode.UZS],
    ['Э/Энергия', 'Аренда/Коммуналка', 'UTILITY', CurrencyCode.UZS],
    ['Газ', 'Аренда/Коммуналка', 'UTILITY', CurrencyCode.UZS],
  ] as Array<[string, string, string, CurrencyCode | null]>) {
    await prisma.expenseArticle.upsert({
      where: { name_section: { name: item[0], section: item[2] } },
      update: { groupName: item[1], defaultCurrency: item[3] },
      create: { name: item[0], groupName: item[1], section: item[2], defaultCurrency: item[3] },
    });
  }

  await prisma.setting.upsert({
    where: { key: 'averageOrderLengthDays' },
    update: { value: '40' },
    create: { key: 'averageOrderLengthDays', value: '40' },
  });

  const customer = await prisma.counterparty.findFirstOrThrow({ where: { name: 'Uztelecom', type: CounterpartyType.CUSTOMER } });
  await prisma.order.upsert({
    where: { number: 'ORD-001' },
    update: {},
    create: {
      number: 'ORD-001',
      counterpartyId: customer.id,
      name: 'Кухня Uztelecom',
      structure: 'Кухня',
      currencyCode: CurrencyCode.USD,
      totalAmount: 5000,
      structureAmount: 5000,
      startDate: new Date('2026-05-01'),
      endDate: new Date('2026-06-10'),
      amountUsd: 5000,
    },
  });
}

main().finally(async () => prisma.$disconnect());
