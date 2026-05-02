'use client';

import { useMemo, useState } from 'react';
import { PageTitle } from '@/components/ui/page-title';
import { SelectField, TextField } from '@/components/ui/field';
import { money } from '@/lib/format';
import { ru } from '@/lib/i18n';
import { useDictionaries, useOtherCounterparties } from '@/lib/hooks';

export default function OtherCounterpartiesPage() {
  const dictionaries = useDictionaries();
  const [filters, setFilters] = useState({ from: '', to: '', counterpartyId: '', currency: '' });
  const params = useMemo(() => {
    const search = new URLSearchParams();
    if (filters.from) search.set('from', filters.from);
    if (filters.to) search.set('to', filters.to);
    if (filters.counterpartyId) search.set('counterpartyId', filters.counterpartyId);
    if (filters.currency) search.set('currency', filters.currency);
    return search.size ? `?${search.toString()}` : '';
  }, [filters]);
  const { data, isLoading } = useOtherCounterparties(params);

  return (
    <>
      <PageTitle title={ru.nav.counterparties} />
      <section className="mb-3 flex flex-wrap gap-2 rounded border border-line bg-white p-2">
        <TextField type="date" value={filters.from} onChange={(event) => setFilters((current) => ({ ...current, from: event.target.value }))} />
        <TextField type="date" value={filters.to} onChange={(event) => setFilters((current) => ({ ...current, to: event.target.value }))} />
        <SelectField value={filters.counterpartyId} onChange={(event) => setFilters((current) => ({ ...current, counterpartyId: event.target.value }))}>
          <option value="">Все контрагенты</option>
          {(dictionaries.data?.counterparties ?? []).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </SelectField>
        <SelectField value={filters.currency} onChange={(event) => setFilters((current) => ({ ...current, currency: event.target.value }))}>
          <option value="">Все валюты</option>
          <option value="UZS">UZS</option>
          <option value="USD">USD</option>
        </SelectField>
      </section>
      <section className="overflow-auto rounded border border-line bg-white">
        <table className="erp-table">
          <thead>
            <tr>
              <th>Контрагент</th>
              <th>Нач. долг</th>
              <th>Начислено</th>
              <th>Оплачено</th>
              <th>Кон. долг</th>
              <th>Валюта</th>
              <th>Кон. долг UZS</th>
              <th>Кон. долг USD</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={8}>{ru.common.loading}</td></tr>}
            {(data ?? []).map((row, index) => {
              const counterparty = row.counterparty as { name: string };
              const currency = String(row.currency ?? 'UZS');
              return (
                <tr key={`${counterparty.name}-${index}`}>
                  <td>{counterparty.name}</td>
                  <td className="text-right">{money(Number(row.openingDebt ?? 0), currency)}</td>
                  <td className="text-right">{money(Number(row.accrued ?? 0), currency)}</td>
                  <td className="text-right">{money(Number(row.paid ?? 0), currency)}</td>
                  <td className="text-right">{money(Number(row.closingDebt ?? 0), currency)}</td>
                  <td>{currency}</td>
                  <td className="text-right">{money(Number(row.closingDebtUzs ?? 0))}</td>
                  <td className="text-right">{money(Number(row.closingDebtUsd ?? 0), 'USD')}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </>
  );
}
