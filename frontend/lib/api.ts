import {
  BalanceReportRow,
  Counterparty,
  DictionaryPayload,
  Employee,
  ExchangeTransaction,
  LoginResponse,
  Order,
  PeriodLock,
  SalaryAccrual,
  SalaryRecord,
  Transaction,
  TransactionType,
  UtilityAccrual,
  UserListItem,
} from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

async function request<T>(path: string, init?: RequestInit, retried = false): Promise<T> {
  const token = typeof window !== 'undefined' ? window.localStorage.getItem('erp-access-token') : null;
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    if (response.status === 401 && !retried && !path.startsWith('/auth/')) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        return request<T>(path, init, true);
      }
    }

    const text = await response.text();
    let message = text || 'Ошибка запроса к серверу';
    try {
      const parsed = JSON.parse(text) as { message?: string | string[]; error?: string };
      message = (Array.isArray(parsed.message) ? parsed.message.join('\n') : parsed.message) ?? parsed.error ?? message;
    } catch {
      // The backend may return plain text for older endpoints.
    }
    if (response.status === 401 && typeof window !== 'undefined') {
      clearAuthAndRedirect();
    }
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

async function refreshAccessToken() {
  if (typeof window === 'undefined') return false;
  const refreshToken = window.localStorage.getItem('erp-refresh-token');
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!response.ok) {
      clearAuthAndRedirect();
      return false;
    }
    const payload = (await response.json()) as { accessToken: string; refreshToken: string; user?: unknown };
    window.localStorage.setItem('erp-access-token', payload.accessToken);
    window.localStorage.setItem('erp-refresh-token', payload.refreshToken);
    if (payload.user) {
      window.localStorage.setItem('erp-user', JSON.stringify(payload.user));
    }
    return true;
  } catch {
    clearAuthAndRedirect();
    return false;
  }
}

function clearAuthAndRedirect() {
  window.localStorage.removeItem('erp-access-token');
  window.localStorage.removeItem('erp-refresh-token');
  window.localStorage.removeItem('erp-user');
  if (!window.location.pathname.startsWith('/login')) {
    window.location.href = '/login';
  }
}

export const api = {
  login: (body: { username: string; password: string }) =>
    request<LoginResponse>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  logout: (refreshToken: string) => request<{ success: boolean }>('/auth/logout', { method: 'POST', body: JSON.stringify({ refreshToken }) }),
  logoutAll: () => request<{ success: boolean }>('/auth/logout-all', { method: 'POST', body: JSON.stringify({}) }),
  users: () => request<UserListItem[]>('/users'),
  employees: () => request<Employee[]>('/employees'),
  createUser: (body: unknown) => request<UserListItem>('/users', { method: 'POST', body: JSON.stringify(body) }),
  updateUser: (id: string, body: unknown) => request<UserListItem>(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteUser: (id: string) => request<UserListItem>(`/users/${id}`, { method: 'DELETE' }),
  updateUserPassword: (id: string, password: string) =>
    request<UserListItem>(`/users/${id}/password`, { method: 'PATCH', body: JSON.stringify({ password }) }),
  activateUser: (id: string) => request<UserListItem>(`/users/${id}/activate`, { method: 'PATCH', body: JSON.stringify({}) }),
  deactivateUser: (id: string) => request<UserListItem>(`/users/${id}/deactivate`, { method: 'PATCH', body: JSON.stringify({}) }),
  periodLocks: () => request<PeriodLock[]>('/period-locks'),
  createPeriodLock: (body: unknown) => request<PeriodLock>('/period-locks', { method: 'POST', body: JSON.stringify(body) }),
  updatePeriodLock: (id: string, body: unknown) => request<PeriodLock>(`/period-locks/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deletePeriodLock: (id: string) => request<PeriodLock>(`/period-locks/${id}`, { method: 'DELETE' }),
  balances: () => request<Array<{ account: { id: string; name: string; type: string }; balanceUzs: string; balanceUsd: string }>>('/balances'),
  pointBalances: () => request<Array<{ point: string; balanceUzs: number; balanceUsd: number; totalUzs: number; totalUsd: number }>>('/balances/points'),
  balanceReport: (params = '') => request<BalanceReportRow[]>(`/balances/report${params}`),
  incomeVsExpense: () => request<Array<{ type: TransactionType; _sum: { totalUzs: string; totalUsd: string } }>>('/balances/income-vs-expense'),
  transactions: (params = '') => request<{ items: Transaction[]; total: number }>(`/transactions${params}`),
  createTransaction: (body: unknown) => request<Transaction>('/transactions', { method: 'POST', body: JSON.stringify(body) }),
  updateTransaction: (id: string, body: unknown) => request<Transaction>(`/transactions/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteTransaction: (id: string) => request<Transaction>(`/transactions/${id}`, { method: 'DELETE' }),
  exchanges: () => request<ExchangeTransaction[]>('/exchanges'),
  createExchange: (body: unknown) => request<ExchangeTransaction>('/exchanges', { method: 'POST', body: JSON.stringify(body) }),
  updateExchange: (id: string, body: unknown) => request<ExchangeTransaction>(`/exchanges/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteExchange: (id: string) => request<ExchangeTransaction>(`/exchanges/${id}`, { method: 'DELETE' }),
  directoryList: (name: string, search = '') => request<unknown[]>(`/directories/${name}${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  createDirectoryItem: (name: string, body: unknown) => request<unknown>(`/directories/${name}`, { method: 'POST', body: JSON.stringify(body) }),
  updateDirectoryItem: (name: string, id: string, body: unknown) => request<unknown>(`/directories/${name}/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteDirectoryItem: (name: string, id: string) => request<unknown>(`/directories/${name}/${id}`, { method: 'DELETE' }),
  orders: (params = '') => request<Order[]>(`/orders${params}`),
  createOrder: (body: unknown) => request<Order>('/orders', { method: 'POST', body: JSON.stringify(body) }),
  updateOrder: (id: string, body: unknown) => request<Order>(`/orders/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteOrder: (id: string) => request<Order>(`/orders/${id}`, { method: 'DELETE' }),
  counterparties: () => request<Counterparty[]>('/counterparties'),
  salary: () => request<SalaryRecord[]>('/salary'),
  salaryAccruals: () => request<SalaryAccrual[]>('/salary-accruals'),
  createSalaryAccrual: (body: unknown) => request<SalaryAccrual>('/salary-accruals', { method: 'POST', body: JSON.stringify(body) }),
  updateSalaryAccrual: (id: string, body: unknown) => request<SalaryAccrual>(`/salary-accruals/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteSalaryAccrual: (id: string) => request<SalaryAccrual>(`/salary-accruals/${id}`, { method: 'DELETE' }),
  dictionaries: () => request<DictionaryPayload>('/dictionaries'),
  utilityAccruals: () => request<UtilityAccrual[]>('/utility-accruals'),
  createUtilityAccrual: (body: unknown) => request<UtilityAccrual>('/utility-accruals', { method: 'POST', body: JSON.stringify(body) }),
  updateUtilityAccrual: (id: string, body: unknown) => request<UtilityAccrual>(`/utility-accruals/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteUtilityAccrual: (id: string) => request<UtilityAccrual>(`/utility-accruals/${id}`, { method: 'DELETE' }),
  otherCounterparties: (params = '') => request<Array<Record<string, unknown>>>(`/other-counterparties${params}`),
  dashboard: () => request<Record<string, unknown>>('/dashboard'),
};
