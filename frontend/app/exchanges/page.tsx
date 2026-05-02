'use client';

import { FormEvent, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { SelectField, TextField } from '@/components/ui/field';
import { PageTitle } from '@/components/ui/page-title';
import { money, shortDate } from '@/lib/format';
import { useCreateExchange, useDeleteExchange, useDictionaries, useExchanges, useUpdateExchange } from '@/lib/hooks';

const initialForm = {
  date: new Date().toISOString().slice(0, 10),
  fromAccountId: '',
  toAccountId: '',
  currencyFrom: 'UZS',
  currencyTo: 'USD',
  amountFrom: '0',
  comment: '',
};

export default function ExchangesPage() {
  const dictionaries = useDictionaries();
  const exchanges = useExchanges();
  const create = useCreateExchange();
  const update = useUpdateExchange();
  const remove = useDeleteExchange();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(initialForm);
  const accounts = dictionaries.data?.cashAccounts ?? [];
  const rate = Number(dictionaries.data?.currencyRates?.find((item) => item.code === 'USD')?.rateToUzs ?? 12600);

  const amountTo = useMemo(() => {
    const amount = Number(form.amountFrom || 0);
    if (form.currencyFrom === form.currencyTo) return amount;
    return form.currencyFrom === 'UZS' ? amount / rate : amount * rate;
  }, [form.amountFrom, form.currencyFrom, form.currencyTo, rate]);

  function setField(name: string, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function reset() {
    setEditingId(null);
    setForm(initialForm);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const body = {
      ...form,
      fromAccountId: form.fromAccountId || accounts[0]?.id,
      toAccountId: form.toAccountId || accounts[0]?.id,
      amountFrom: Number(form.amountFrom),
      amountTo,
      rate,
    };

    if (editingId) {
      update.mutate({ id: editingId, body }, { onSuccess: reset });
    } else {
      create.mutate(body, { onSuccess: reset });
    }
  }

  return (
    <>
      <PageTitle title="Обмен валют" />
      <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
        <section className="overflow-auto rounded border border-line bg-white">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Дата</th>
                <th>Откуда</th>
                <th>Куда</th>
                <th>Валюта из</th>
                <th>Валюта в</th>
                <th>Сумма из</th>
                <th>Сумма в</th>
                <th>Курс</th>
                <th>Комментарий</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {exchanges.isLoading && (
                <tr>
                  <td colSpan={10}>Загрузка...</td>
                </tr>
              )}
              {(exchanges.data ?? []).map((row) => (
                <tr key={row.id}>
                  <td>{shortDate(row.date)}</td>
                  <td>{row.fromAccount.name}</td>
                  <td>{row.toAccount.name}</td>
                  <td>{row.currencyFrom}</td>
                  <td>{row.currencyTo}</td>
                  <td className="text-right">{money(row.amountFrom, row.currencyFrom)}</td>
                  <td className="text-right">{money(row.amountTo, row.currencyTo)}</td>
                  <td className="text-right">{Number(row.rate).toLocaleString('ru-RU')}</td>
                  <td>{row.comment ?? '-'}</td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        className="text-[var(--accent-text)]"
                        type="button"
                        onClick={() => {
                          setEditingId(row.id);
                          setForm({
                            date: row.date.slice(0, 10),
                            fromAccountId: row.fromAccount.id,
                            toAccountId: row.toAccount.id,
                            currencyFrom: row.currencyFrom,
                            currencyTo: row.currencyTo,
                            amountFrom: String(row.amountFrom),
                            comment: row.comment ?? '',
                          });
                        }}
                      >
                        Редактировать
                      </button>
                      <button
                        className="text-danger"
                        type="button"
                        onClick={() => window.confirm('Удалить обмен?') && remove.mutate(row.id)}
                      >
                        Удалить
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <form onSubmit={submit} className="rounded border border-line bg-white">
          <div className="border-b border-line bg-panel px-3 py-2 text-sm font-semibold">
            {editingId ? 'Редактировать обмен' : 'Добавить обмен'}
          </div>
          <div className="grid gap-3 p-3">
            <TextField type="date" value={form.date} onChange={(event) => setField('date', event.target.value)} />
            <SelectField value={form.fromAccountId || accounts[0]?.id || ''} onChange={(event) => setField('fromAccountId', event.target.value)}>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>{account.name}</option>
              ))}
            </SelectField>
            <SelectField value={form.toAccountId || accounts[0]?.id || ''} onChange={(event) => setField('toAccountId', event.target.value)}>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>{account.name}</option>
              ))}
            </SelectField>
            <div className="grid grid-cols-2 gap-2">
              <SelectField value={form.currencyFrom} onChange={(event) => setField('currencyFrom', event.target.value)}>
                <option value="UZS">UZS</option>
                <option value="USD">USD</option>
              </SelectField>
              <SelectField value={form.currencyTo} onChange={(event) => setField('currencyTo', event.target.value)}>
                <option value="UZS">UZS</option>
                <option value="USD">USD</option>
              </SelectField>
            </div>
            <TextField type="number" min="0" step="0.01" value={form.amountFrom} onChange={(event) => setField('amountFrom', event.target.value)} placeholder="Сумма из" />
            <TextField value={rate.toLocaleString('ru-RU')} readOnly placeholder="Курс" />
            <TextField value={amountTo.toFixed(2)} readOnly placeholder="Сумма в" />
            <TextField value={form.comment} onChange={(event) => setField('comment', event.target.value)} placeholder="Комментарий" />
            <Button disabled={create.isPending || update.isPending || accounts.length === 0} type="submit">
              {editingId ? 'Сохранить' : 'Добавить'}
            </Button>
            {editingId && <button className="h-9 rounded border border-line" type="button" onClick={reset}>Отмена</button>}
          </div>
        </form>
      </div>
    </>
  );
}
