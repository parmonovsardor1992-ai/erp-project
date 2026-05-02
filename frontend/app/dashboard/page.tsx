'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { PageTitle } from '@/components/ui/page-title';
import { useDashboard, useIncomeVsExpense } from '@/lib/hooks';
import { money } from '@/lib/format';
import { cashAccountTypeRu, ru, transactionTypeRu } from '@/lib/i18n';
import { BalanceReportRow } from '@/lib/types';

export default function DashboardPage() {
  const dashboard = useDashboard();
  const flow = useIncomeVsExpense();
  const summary = dashboard.data as {
    balances?: BalanceReportRow[];
    totalUzs?: number;
    totalUsd?: number;
    employeeDebts?: number;
    counterpartyDebts?: number;
    activeOrders?: number;
  } | undefined;
  const balances = summary?.balances ?? [];
  const chartData = (flow.data ?? []).map((row) => ({
    name: transactionTypeRu[row.type],
    amount: Number(row._sum.totalUzs ?? 0),
  }));

  return (
    <>
      <PageTitle title={ru.nav.dashboard} />
      <section className="mb-4 grid gap-3 md:grid-cols-3">
        {balances.map((item) => (
          <div key={item.account.id} className="rounded border border-line bg-white p-3 shadow-table">
            <div className="mb-1 text-xs uppercase text-muted">{cashAccountTypeRu[item.account.type] ?? item.account.type}</div>
            <div className="text-sm font-semibold">{item.account.name}</div>
            <div className="mt-3 text-lg font-semibold">{money(item.closingBalanceUzs)}</div>
            <div className="text-sm text-muted">{money(item.closingBalanceUsd, 'USD')}</div>
          </div>
        ))}
        <Kpi title="Общий остаток" value={money(Number(summary?.totalUzs ?? 0))} hint={money(Number(summary?.totalUsd ?? 0), 'USD')} />
        <Kpi title="Долги сотрудников" value={money(Number(summary?.employeeDebts ?? 0))} />
        <Kpi title="Долги контрагентов" value={money(Number(summary?.counterpartyDebts ?? 0))} />
        <Kpi title="Активные заказы" value={String(Number(summary?.activeOrders ?? 0))} />
      </section>
      <section className="rounded border border-line bg-white p-3">
        <div className="mb-3 text-sm font-semibold">{ru.finance.incomeVsExpense}</div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => money(Number(value))} />
              <Bar dataKey="amount" fill="#2563eb" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </>
  );
}

function Kpi({ title, value, hint }: { title: string; value: string; hint?: string }) {
  return (
    <div className="rounded border border-line bg-white p-3 shadow-table">
      <div className="mb-1 text-xs uppercase text-muted">{title}</div>
      <div className="mt-3 text-lg font-semibold">{value}</div>
      {hint && <div className="text-sm text-muted">{hint}</div>}
    </div>
  );
}
