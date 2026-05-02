import { CashAccountType, CounterpartyType, TransactionType } from './types';

export const ru = {
  appName: 'ERP Бухгалтерия',
  workspace: 'Рабочее место бухгалтера',
  nav: {
    dashboard: 'Панель',
    finance: 'Финансы',
    cash: 'Касса',
    bank: 'Банк',
    card: 'Карта',
    exchanges: 'Обмен валют',
    orders: 'Заказы',
    salary: 'ЗП сотрудников',
    salaryAccruals: 'Начисление ЗП',
    utilityAccruals: 'Начисление коммуналки',
    counterparties: 'Прочие контрагенты',
    dictionaries: 'Справочники',
    cashBalances: 'Остатки ДС',
  },
  common: {
    loading: 'Загрузка...',
    notSpecified: '-',
    edit: 'Редактировать',
    delete: 'Удалить',
    cancel: 'Отмена',
    save: 'Сохранить',
    add: 'Добавить',
    actions: 'Действия',
  },
  finance: {
    allOperations: 'Все операции',
    addTransaction: 'Добавить операцию',
    editTransaction: 'Редактировать операцию',
    journal: 'Журнал ДС',
    fromDate: 'Дата с',
    toDate: 'Дата по',
    cashAccountId: 'Счет',
    counterpartyId: 'Контрагент',
    categoryId: 'Категория',
    description: 'Описание',
    add: 'Добавить',
    save: 'Сохранить',
    incomeVsExpense: 'Доходы и расходы',
  },
  table: {
    date: 'Дата',
    type: 'Тип',
    account: 'Счет',
    counterparty: 'Контрагент',
    description: 'Описание',
    rate: 'Курс',
    totalUzs: 'Итого UZS',
    totalUsd: 'Итого USD',
    number: 'Номер',
    customer: 'Клиент',
    structure: 'Структура',
    status: 'Статус',
    startDate: 'Дата начала',
    amountUzs: 'Сумма UZS',
    amountUsd: 'Сумма USD',
    period: 'Период',
    employee: 'Сотрудник',
    startBalance: 'Начальный остаток',
    accrued: 'Начислено',
    paid: 'Оплачено',
    finalBalance: 'Конечный остаток',
    name: 'Название',
    phone: 'Телефон',
    taxId: 'ИНН',
    debt: 'Долг',
  },
};

export const transactionTypeRu: Record<TransactionType, string> = {
  INCOME: 'Приход',
  EXPENSE: 'Расход',
  EXCHANGE: 'Обмен',
};

export const cashAccountTypeRu: Record<CashAccountType, string> = {
  CASH: 'Касса',
  BANK: 'Банк',
  CARD: 'Карта',
};

export const counterpartyTypeRu: Record<CounterpartyType, string> = {
  CUSTOMER: 'Покупатель',
  SUPPLIER: 'Поставщик',
  EMPLOYEE: 'Сотрудник',
};

export const orderStatusRu: Record<string, string> = {
  NEW: 'Новый',
  IN_PROGRESS: 'В работе',
  COMPLETED: 'Завершен',
  CANCELLED: 'Отменен',
};
