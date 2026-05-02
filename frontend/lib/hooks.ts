import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './api';

export function useBalances() {
  return useQuery({ queryKey: ['balances'], queryFn: api.balances });
}

export function usePointBalances() {
  return useQuery({ queryKey: ['point-balances'], queryFn: api.pointBalances });
}

export function useBalanceReport(params: string) {
  return useQuery({ queryKey: ['balance-report', params], queryFn: () => api.balanceReport(params) });
}

export function useIncomeVsExpense() {
  return useQuery({ queryKey: ['income-vs-expense'], queryFn: api.incomeVsExpense });
}

export function useTransactions(params: string) {
  return useQuery({ queryKey: ['transactions', params], queryFn: () => api.transactions(params) });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createTransaction,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['transactions'] });
      await queryClient.invalidateQueries({ queryKey: ['balances'] });
      await queryClient.invalidateQueries({ queryKey: ['point-balances'] });
      await queryClient.invalidateQueries({ queryKey: ['income-vs-expense'] });
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: unknown }) => api.updateTransaction(id, body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['transactions'] });
      await queryClient.invalidateQueries({ queryKey: ['balances'] });
      await queryClient.invalidateQueries({ queryKey: ['point-balances'] });
      await queryClient.invalidateQueries({ queryKey: ['balance-report'] });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteTransaction,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['transactions'] });
      await queryClient.invalidateQueries({ queryKey: ['balances'] });
      await queryClient.invalidateQueries({ queryKey: ['point-balances'] });
      await queryClient.invalidateQueries({ queryKey: ['balance-report'] });
    },
  });
}

export function useExchanges() {
  return useQuery({ queryKey: ['exchanges'], queryFn: api.exchanges });
}

export function useCreateExchange() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createExchange,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['exchanges'] });
      await queryClient.invalidateQueries({ queryKey: ['balance-report'] });
      await queryClient.invalidateQueries({ queryKey: ['point-balances'] });
    },
  });
}

export function useUpdateExchange() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: unknown }) => api.updateExchange(id, body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['exchanges'] });
      await queryClient.invalidateQueries({ queryKey: ['balance-report'] });
      await queryClient.invalidateQueries({ queryKey: ['point-balances'] });
    },
  });
}

export function useDeleteExchange() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteExchange,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['exchanges'] });
      await queryClient.invalidateQueries({ queryKey: ['balance-report'] });
      await queryClient.invalidateQueries({ queryKey: ['point-balances'] });
    },
  });
}

export function useDirectoryList(name: string, search: string) {
  return useQuery({ queryKey: ['directory', name, search], queryFn: () => api.directoryList(name, search) });
}

export function useCreateDirectoryItem(name: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) => api.createDirectoryItem(name, body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['directory', name] });
      await queryClient.invalidateQueries({ queryKey: ['dictionaries'] });
      if (name === 'employees') await queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
}

export function useUpdateDirectoryItem(name: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: unknown }) => api.updateDirectoryItem(name, id, body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['directory', name] });
      await queryClient.invalidateQueries({ queryKey: ['dictionaries'] });
      if (name === 'employees') await queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
}

export function useDeleteDirectoryItem(name: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteDirectoryItem(name, id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['directory', name] });
      await queryClient.invalidateQueries({ queryKey: ['dictionaries'] });
      if (name === 'employees') await queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
}

export function useOrders(params = '') {
  return useQuery({ queryKey: ['orders', params], queryFn: () => api.orders(params) });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createOrder,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['orders'] });
      await queryClient.invalidateQueries({ queryKey: ['dictionaries'] });
    },
  });
}

export function useUpdateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: unknown }) => api.updateOrder(id, body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['orders'] });
      await queryClient.invalidateQueries({ queryKey: ['dictionaries'] });
    },
  });
}

export function useDeleteOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteOrder,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['orders'] });
      await queryClient.invalidateQueries({ queryKey: ['dictionaries'] });
    },
  });
}

export function useDictionaries() {
  return useQuery({ queryKey: ['dictionaries'], queryFn: api.dictionaries });
}

export function useEmployees() {
  return useQuery({ queryKey: ['employees'], queryFn: api.employees });
}

export function useCounterparties() {
  return useQuery({ queryKey: ['counterparties'], queryFn: api.counterparties });
}

export function useSalary() {
  return useQuery({ queryKey: ['salary'], queryFn: api.salary });
}

export function useSalaryAccruals() {
  return useQuery({ queryKey: ['salary-accruals'], queryFn: api.salaryAccruals });
}

export function useCreateSalaryAccrual() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createSalaryAccrual,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['salary-accruals'] });
      await queryClient.invalidateQueries({ queryKey: ['salary'] });
    },
  });
}

export function useUpdateSalaryAccrual() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: unknown }) => api.updateSalaryAccrual(id, body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['salary-accruals'] });
      await queryClient.invalidateQueries({ queryKey: ['salary'] });
    },
  });
}

export function useDeleteSalaryAccrual() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteSalaryAccrual,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['salary-accruals'] });
      await queryClient.invalidateQueries({ queryKey: ['salary'] });
    },
  });
}

export function useUtilityAccruals() {
  return useQuery({ queryKey: ['utility-accruals'], queryFn: api.utilityAccruals });
}

export function useCreateUtilityAccrual() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createUtilityAccrual,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['utility-accruals'] });
    },
  });
}

export function useUpdateUtilityAccrual() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: unknown }) => api.updateUtilityAccrual(id, body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['utility-accruals'] });
      await queryClient.invalidateQueries({ queryKey: ['other-counterparties'] });
    },
  });
}

export function useDeleteUtilityAccrual() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteUtilityAccrual,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['utility-accruals'] });
      await queryClient.invalidateQueries({ queryKey: ['other-counterparties'] });
    },
  });
}

export function useOtherCounterparties(params: string) {
  return useQuery({ queryKey: ['other-counterparties', params], queryFn: () => api.otherCounterparties(params) });
}

export function useDashboard() {
  return useQuery({ queryKey: ['dashboard'], queryFn: api.dashboard });
}

export function useUsers() {
  return useQuery({ queryKey: ['users'], queryFn: api.users });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createUser,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: unknown }) => api.updateUser(id, body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteUser,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useUpdateUserPassword() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) => api.updateUserPassword(id, password),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useActivateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.activateUser,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useDeactivateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deactivateUser,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function usePeriodLocks() {
  return useQuery({ queryKey: ['period-locks'], queryFn: api.periodLocks });
}

export function useCreatePeriodLock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createPeriodLock,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['period-locks'] });
    },
  });
}

export function useUpdatePeriodLock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: unknown }) => api.updatePeriodLock(id, body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['period-locks'] });
    },
  });
}

export function useDeletePeriodLock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deletePeriodLock,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['period-locks'] });
    },
  });
}
