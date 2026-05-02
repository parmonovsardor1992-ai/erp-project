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

export function useOrders() {
  return useQuery({ queryKey: ['orders'], queryFn: api.orders });
}

export function useDictionaries() {
  return useQuery({ queryKey: ['dictionaries'], queryFn: api.dictionaries });
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

export function useOtherCounterparties(params: string) {
  return useQuery({ queryKey: ['other-counterparties', params], queryFn: () => api.otherCounterparties(params) });
}

export function useDashboard() {
  return useQuery({ queryKey: ['dashboard'], queryFn: api.dashboard });
}
