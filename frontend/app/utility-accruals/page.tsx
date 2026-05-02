'use client';

import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { SelectField, TextField } from '@/components/ui/field';
import { PageTitle } from '@/components/ui/page-title';
import { money, shortDate } from '@/lib/format';
import { useCreateUtilityAccrual, useDeleteUtilityAccrual, useDictionaries, useUpdateUtilityAccrual, useUtilityAccruals } from '@/lib/hooks';
import { ru } from '@/lib/i18n';
import { UtilityAccrual } from '@/lib/types';

const initialForm = { date: new Date().toISOString().slice(0, 10), counterpartyId: '', expenseArticleId: '', currencyCode: 'UZS', amount: '0', comment: '' };

export default function UtilityAccrualsPage() {
  const { data, isLoading } = useUtilityAccruals();
  const dictionaries = useDictionaries();
  const create = useCreateUtilityAccrual();
  const update = useUpdateUtilityAccrual();
  const remove = useDeleteUtilityAccrual();
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const articles = (dictionaries.data?.expenseArticles ?? []).filter((item) => item.section === 'UTILITY');

  function submit(event: FormEvent) {
    event.preventDefault();
    const body = { ...form, amount: Number(form.amount) };
    if (editingId) {
      update.mutate({ id: editingId, body }, { onSuccess: reset });
    } else {
      create.mutate(body, { onSuccess: reset });
    }
  }

  function edit(row: UtilityAccrual) {
    setEditingId(row.id);
    setForm({
      date: row.date.slice(0, 10),
      counterpartyId: row.counterparty.id,
      expenseArticleId: row.expenseArticle?.id ?? '',
      currencyCode: row.currencyCode,
      amount: String(row.amount),
      comment: row.comment ?? '',
    });
  }

  function reset() {
    setEditingId(null);
    setForm(initialForm);
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
                <th>Комментарий</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && <tr><td colSpan={10}>{ru.common.loading}</td></tr>}
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
                  <td>{row.comment ?? '-'}</td>
                  <td>
                    <div className="flex gap-2">
                      <button className="text-[var(--accent-text)]" type="button" onClick={() => edit(row)}>Редактировать</button>
                      <button className="text-danger" type="button" onClick={() => window.confirm('Удалить начисление коммуналки?') && remove.mutate(row.id)}>Удалить</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <form onSubmit={submit} className="rounded border border-line bg-white">
          <div className="border-b border-line bg-panel px-3 py-2 text-sm font-semibold">{editingId ? 'Редактировать начисление' : 'Добавить начисление'}</div>
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
            <TextField value={form.comment} onChange={(event) => setForm((current) => ({ ...current, comment: event.target.value }))} placeholder="Комментарий" />
            <Button disabled={create.isPending || update.isPending || !form.counterpartyId} type="submit">{editingId ? 'Сохранить' : 'Добавить'}</Button>
            {editingId && <button className="h-9 rounded border border-line" type="button" onClick={reset}>Отмена</button>}
          </div>
        </form>
      </div>
    </>
  );
}
