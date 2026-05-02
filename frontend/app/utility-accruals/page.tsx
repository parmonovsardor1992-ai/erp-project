'use client';

import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { SelectField, TextField } from '@/components/ui/field';
import { PageTitle } from '@/components/ui/page-title';
import { money, shortDate } from '@/lib/format';
import { ru } from '@/lib/i18n';
import { useCreateUtilityAccrual, useDictionaries, useUtilityAccruals } from '@/lib/hooks';

export default function UtilityAccrualsPage() {
  const { data, isLoading } = useUtilityAccruals();
  const dictionaries = useDictionaries();
  const create = useCreateUtilityAccrual();
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), counterpartyId: '', expenseArticleId: '', currencyCode: 'UZS', amount: '0' });
  const articles = (dictionaries.data?.expenseArticles ?? []).filter((item) => item.section === 'UTILITY');

  function submit(event: FormEvent) {
    event.preventDefault();
    create.mutate({ ...form, amount: Number(form.amount) });
  }

  return (
    <>
      <PageTitle title={ru.nav.utilityAccruals} />
      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <section className="overflow-auto rounded border border-line bg-white">
          <table className="erp-table">
            <thead>
              <tr>
                <th>{ru.table.date}</th>
                <th>{ru.table.counterparty}</th>
                <th>Статья</th>
                <th>Валюта</th>
                <th>Сумма</th>
                <th>{ru.table.rate}</th>
                <th>{ru.table.amountUzs}</th>
                <th>{ru.table.amountUsd}</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && <tr><td colSpan={8}>{ru.common.loading}</td></tr>}
              {(data ?? []).map((row) => (
                <tr key={row.id}>
                  <td>{shortDate(row.date)}</td>
                  <td>{row.counterparty.name}</td>
                <td>{row.expenseArticle?.name ?? row.category?.name ?? '-'}</td>
                  <td>{row.currencyCode}</td>
                  <td className="text-right">{money(row.amount, row.currencyCode)}</td>
                  <td className="text-right">{Number(row.rate).toLocaleString('ru-RU')}</td>
                  <td className="text-right">{money(row.amountUzs)}</td>
                  <td className="text-right">{money(row.amountUsd, 'USD')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <form onSubmit={submit} className="rounded border border-line bg-white">
          <div className="border-b border-line bg-panel px-3 py-2 text-sm font-semibold">Добавить начисление</div>
          <div className="grid gap-3 p-3">
            <TextField type="date" value={form.date} onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))} />
            <SelectField value={form.counterpartyId} onChange={(event) => setForm((current) => ({ ...current, counterpartyId: event.target.value }))}>
              <option value="">Контрагент</option>
              {(dictionaries.data?.suppliers ?? []).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </SelectField>
            <SelectField value={form.expenseArticleId} onChange={(event) => {
              const article = articles.find((item) => item.id === event.target.value);
              setForm((current) => ({ ...current, expenseArticleId: event.target.value, currencyCode: article?.defaultCurrency ?? current.currencyCode }));
            }}>
              <option value="">Статья</option>
              {articles.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </SelectField>
            <SelectField value={form.currencyCode} onChange={(event) => setForm((current) => ({ ...current, currencyCode: event.target.value }))}>
              <option value="UZS">UZS</option>
              <option value="USD">USD</option>
            </SelectField>
            <TextField type="number" min="0" step="0.01" value={form.amount} onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))} />
            <Button disabled={create.isPending || !form.counterpartyId} type="submit">{ru.finance.save}</Button>
          </div>
        </form>
      </div>
    </>
  );
}
