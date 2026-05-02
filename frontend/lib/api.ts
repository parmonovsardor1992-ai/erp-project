import { BalanceReportRow, Counterparty, DictionaryPayload, Order, SalaryAccrual, SalaryRecord, Transaction, TransactionType, UtilityAccrual } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json() as Promise<T>;
}

export const api = {
  balances: () => request<Array<{ account: { id: string; name: string; type: string }; balanceUzs: string; balanceUsd: string }>>('/balances'),
  pointBalances: () => request<Array<{ point: string; balanceUzs: number; balanceUsd: number; totalUzs: number; totalUsd: number }>>('/balances/points'),
  balanceReport: (params = '') => request<BalanceReportRow[]>(`/balances/report${params}`),
  incomeVsExpense: () => request<Array<{ type: TransactionType; _sum: { totalUzs: string; totalUsd: string } }>>('/balances/income-vs-expense'),
  transactions: (params = '') => request<{ items: Transaction[]; total: number }>(`/transactions${params}`),
  createTransaction: (body: unknown) => request<Transaction>('/transactions', { method: 'POST', body: JSON.stringify(body) }),
  orders: () => request<Order[]>('/orders'),
  counterparties: () => request<Counterparty[]>('/counterparties'),
  salary: () => request<SalaryRecord[]>('/salary'),
  salaryAccruals: () => request<SalaryAccrual[]>('/salary-accruals'),
  createSalaryAccrual: (body: unknown) => request<SalaryAccrual>('/salary-accruals', { method: 'POST', body: JSON.stringify(body) }),
  dictionaries: () => request<DictionaryPayload>('/dictionaries'),
  utilityAccruals: () => request<UtilityAccrual[]>('/utility-accruals'),
  createUtilityAccrual: (body: unknown) => request<UtilityAccrual>('/utility-accruals', { method: 'POST', body: JSON.stringify(body) }),
  otherCounterparties: (params = '') => request<Array<Record<string, unknown>>>(`/other-counterparties${params}`),
  dashboard: () => request<Record<string, unknown>>('/dashboard'),
};
