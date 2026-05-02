'use client';

import { useMemo, useState } from 'react';
import { PageTitle } from '@/components/ui/page-title';
import { SelectField, TextField } from '@/components/ui/field';
import { money } from '@/lib/format';
import { cashAccountTypeRu, ru } from '@/lib/i18n';
import { useBalanceReport } from '@/lib/hooks';
import { CashAccountType } from '@/lib/types';

export default function BalancesPage() {
  const [filters, setFilters] = useState({ from: '', to: '', accountType: '' });
  const params = useMemo(() => {
    const search = new URLSearchParams();
    if (filters.from) search.set('from', filters.from);
    if (filters.to) search.set('to', filters.to);
    if (filters.accountType) search.set('accountType', filters.accountType);
    return search.size ? `?${search.toString()}` : '';
  }, [filters]);
  const { data, isLoading } = useBalanceReport(params);

  return (
    <>
      <PageTitle title={ru.nav.cashBalances} />
      <section className="mb-3 flex flex-wrap gap-2 rounded border border-line bg-white p-2">
        <TextField type="date" value={filters.from} onChange={(event) => setFilters((current) => ({ ...current, from: event.target.value }))} />
        <TextField type="date" value={filters.to} onChange={(event) => setFilters((current) => ({ ...current, to: event.target.value }))} />
        <SelectField value={filters.accountType} onChange={(event) => setFilters((current) => ({ ...current, accountType: event.target.value }))}>
          <option value="">Все точки ДС</option>
          <option value="CASH">Касса</option>
          <option value="BANK">Банк</option>
          <option value="CARD">Карта</option>
        </SelectField>
      </section>
      <section className="overflow-auto rounded border border-line bg-white">
        <table className="erp-table">
          <thead className="sticky top-0 z-[1]">
            <tr>
              <th>Счет</th>
              <th>Нач. UZS</th>
              <th>Приход UZS</th>
              <th>Расход UZS</th>
              <th>Обмен + UZS</th>
              <th>Обмен - UZS</th>
              <th>Кон. UZS</th>
              <th>Нач. USD</th>
              <th>Приход USD</th>
              <th>Расход USD</th>
              <th>Обмен + USD</th>
              <th>Обмен - USD</th>
              <th>Кон. USD</th>
              <th>Итого UZS</th>
              <th>Итого USD</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={15}>{ru.common.loading}</td></tr>}
            {(data ?? []).map((row) => (
              <tr key={row.account.id}>
                <td>{cashAccountTypeRu[row.account.type as CashAccountType]}</td>
                <td className="text-right">{money(row.openingBalanceUzs)}</td>
                <td className="text-right">{money(row.incomeUzs)}</td>
                <td className="text-right">{money(row.expenseUzs)}</td>
                <td className="text-right">{money(row.exchangeInUzs)}</td>
                <td className="text-right">{money(row.exchangeOutUzs)}</td>
                <td className="text-right font-medium">{money(row.closingBalanceUzs)}</td>
                <td className="text-right">{money(row.openingBalanceUsd, 'USD')}</td>
                <td className="text-right">{money(row.incomeUsd, 'USD')}</td>
                <td className="text-right">{money(row.expenseUsd, 'USD')}</td>
                <td className="text-right">{money(row.exchangeInUsd, 'USD')}</td>
                <td className="text-right">{money(row.exchangeOutUsd, 'USD')}</td>
                <td className="text-right font-medium">{money(row.closingBalanceUsd, 'USD')}</td>
                <td className="text-right font-medium">{money(row.totalInUzs)}</td>
                <td className="text-right font-medium">{money(row.totalInUsd, 'USD')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
