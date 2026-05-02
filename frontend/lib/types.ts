export type TransactionType = 'INCOME' | 'EXPENSE' | 'EXCHANGE';
export type CashAccountType = 'CASH' | 'BANK' | 'CARD';
export type CounterpartyType = 'CUSTOMER' | 'SUPPLIER' | 'EMPLOYEE';

export type CashAccount = {
  id: string;
  name: string;
  type: CashAccountType;
  currencyCode: 'UZS' | 'USD';
};

export type Category = {
  id: string;
  name: string;
  type: 'INCOME' | 'EXPENSE';
};

export type ExpenseArticle = {
  id: string;
  name: string;
  groupName?: string;
  section: string;
  defaultCurrency?: 'UZS' | 'USD';
};

export type MovementType = {
  id: string;
  name: string;
  paymentType: TransactionType;
};

export type Counterparty = {
  id: string;
  name: string;
  type: CounterpartyType;
  phone?: string;
  taxId?: string;
  debtUzs?: number;
};

export type Transaction = {
  id: string;
  date: string;
  type: TransactionType;
  description?: string;
  amountUzs: string;
  amountUsd: string;
  rate: string;
  totalUzs: string;
  totalUsd: string;
  signedTotalUzs: string;
  signedTotalUsd: string;
  cashAccount: CashAccount;
  category?: Category;
  expenseArticle?: ExpenseArticle;
  movementType?: MovementType;
  counterparty?: Counterparty;
  order?: Order;
  orderStructure?: string;
  comment?: string;
};

export type Order = {
  id: string;
  number: string;
  name: string;
  structure?: string;
  currencyCode: 'UZS' | 'USD';
  totalAmount: string;
  structureAmount: string;
  status: 'NEW' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  startDate: string;
  endDate?: string;
  amountUzs: string;
  amountUsd: string;
  counterparty: Counterparty;
};

export type SalaryRecord = {
  id?: string;
  period: string;
  openingBalance?: number;
  startBalance?: string;
  accrued: number | string;
  paid: number | string;
  closingBalance?: number;
  finalBalance?: string;
  position?: string;
  department?: { id: string; name: string };
  employee: Counterparty;
};

export type DictionaryPayload = {
  customers: Counterparty[];
  suppliers: Counterparty[];
  employees: Counterparty[];
  counterparties: Counterparty[];
  currencies: Array<{ id: string; code: 'UZS' | 'USD'; name: string }>;
  currencyRates: Array<{ id: string; code: 'UZS' | 'USD'; date: string; rateToUzs: string }>;
  cashAccounts: CashAccount[];
  movementTypes: MovementType[];
  expenseCategories: Category[];
  expenseArticles?: ExpenseArticle[];
  departments: Array<{ id: string; name: string }>;
  employeesDetailed?: Array<{ id: string; position: string; counterparty: Counterparty; department?: { id: string; name: string } }>;
  products: Array<{ id: string; name: string; unit?: string }>;
  orders: Order[];
  paymentTypes: Array<{ id: TransactionType; name: string }>;
  cashAccountTypes: Array<{ id: CashAccountType; name: string }>;
};

export type UtilityAccrual = {
  id: string;
  date: string;
  currencyCode: 'UZS' | 'USD';
  amount: string;
  rate: string;
  amountUzs: string;
  amountUsd: string;
  counterparty: Counterparty;
  category?: Category;
  expenseArticle?: ExpenseArticle;
};

export type ExchangeTransaction = {
  id: string;
  date: string;
  fromAccount: CashAccount;
  toAccount: CashAccount;
  currencyFrom: 'UZS' | 'USD';
  currencyTo: 'UZS' | 'USD';
  amountFrom: string;
  amountTo: string;
  rate: string;
  comment?: string;
};

export type SalaryAccrual = {
  id: string;
  date: string;
  employee: { id: string; position: string; counterparty: Counterparty; department?: { id: string; name: string } };
  position: string;
  department?: { id: string; name: string };
  accrualMethod: string;
  currencyCode: 'UZS' | 'USD';
  amount: string;
  rate: string;
  amountUzs: string;
  amountUsd: string;
  comment?: string;
};

export type BalanceReportRow = {
  account: CashAccount;
  openingBalanceUzs: number;
  incomeUzs: number;
  expenseUzs: number;
  exchangeInUzs: number;
  exchangeOutUzs: number;
  closingBalanceUzs: number;
  openingBalanceUsd: number;
  incomeUsd: number;
  expenseUsd: number;
  exchangeInUsd: number;
  exchangeOutUsd: number;
  closingBalanceUsd: number;
  totalInUzs: number;
  totalInUsd: number;
};
