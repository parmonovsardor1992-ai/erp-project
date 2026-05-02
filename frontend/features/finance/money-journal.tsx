'use client';

import { FormEvent, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SelectField, TextField } from '@/components/ui/field';
import { PageTitle } from '@/components/ui/page-title';
import { money, shortDate } from '@/lib/format';
import { cashAccountTypeRu, ru, transactionTypeRu } from '@/lib/i18n';
import { useCreateTransaction, useDeleteTransaction, useDictionaries, useTransactions, useUpdateTransaction } from '@/lib/hooks';
import { CashAccountType, TransactionType } from '@/lib/types';

type Props = { accountType: CashAccountType; title: string };

const initialForm = {
  date: new Date().toISOString().slice(0, 10),
  type: 'INCOME' as TransactionType,
  movementTypeId: '',
  expenseArticleId: '',
  counterpartyId: '',
  orderId: '',
  orderStructure: '',
  cashAccountId: '',
  amountUzs: '0',
  amountUsd: '0',
  comment: '',
};

export function MoneyJournal({ accountType, title }: Props) {
  const dictionaries = useDictionaries();
  const createTransaction = useCreateTransaction();
  const updateTransaction = useUpdateTransaction();
  const deleteTransaction = useDeleteTransaction();
  const [filters, setFilters] = useState({ from: '', to: '', type: 'ALL', movementTypeId: '', counterpartyId: '' });
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const params = useMemo(() => {
    const search = new URLSearchParams({ page: '1', limit: '100', accountType });
    if (filters.from) search.set('from', filters.from);
    if (filters.to) search.set('to', filters.to);
    if (filters.type !== 'ALL') search.set('type', filters.type);
    if (filters.movementTypeId) search.set('movementTypeId', filters.movementTypeId);
    if (filters.counterpartyId) search.set('counterpartyId', filters.counterpartyId);
    return `?${search.toString()}`;
  }, [accountType, filters]);

  const transactions = useTransactions(params);
  const dict = dictionaries.data;
  const rows = transactions.data?.items ?? [];
  const accounts = (dict?.cashAccounts ?? []).filter((account) => account.type === accountType);
  const movements = (dict?.movementTypes ?? []).filter((movement) => movement.paymentType === form.type);
  const filterMovements = (dict?.movementTypes ?? []).filter((movement) => filters.type === 'ALL' || movement.paymentType === filters.type);
  const incomeUzs = rows.filter((row) => row.type === 'INCOME').reduce((sum, row) => sum + Number(row.totalUzs), 0);
  const expenseUzs = rows.filter((row) => row.type === 'EXPENSE').reduce((sum, row) => sum + Number(row.totalUzs), 0);
  const incomeUsd = rows.filter((row) => row.type === 'INCOME').reduce((sum, row) => sum + Number(row.totalUsd), 0);
  const expenseUsd = rows.filter((row) => row.type === 'EXPENSE').reduce((sum, row) => sum + Number(row.totalUsd), 0);
  const balanceUzs = rows.reduce((sum, row) => sum + Number(row.signedTotalUzs), 0);
  const balanceUsd = rows.reduce((sum, row) => sum + Number(row.signedTotalUsd), 0);

  function setFormField(name: string, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const body = {
      ...form,
      cashAccountId: form.cashAccountId || accounts[0]?.id,
      movementTypeId: form.movementTypeId || undefined,
      expenseArticleId: form.expenseArticleId || undefined,
      counterpartyId: form.counterpartyId || undefined,
      orderId: form.orderId || undefined,
      orderStructure: form.orderStructure || undefined,
      amountUzs: Number(form.amountUzs),
      amountUsd: Number(form.amountUsd),
      description: form.comment,
      comment: form.comment,
    };

    if (editingId) {
      updateTransaction.mutate({ id: editingId, body }, { onSuccess: resetForm });
    } else {
      createTransaction.mutate(body, { onSuccess: resetForm });
    }
  }

  function resetForm() {
    setEditingId(null);
    setForm(initialForm);
  }

  function editTransaction(item: typeof rows[number]) {
    setEditingId(item.id);
    setForm({
      date: item.date.slice(0, 10),
      type: item.type,
      movementTypeId: item.movementType?.id ?? '',
      expenseArticleId: item.expenseArticle?.id ?? '',
      counterpartyId: item.counterparty?.id ?? '',
      orderId: item.order?.id ?? '',
      orderStructure: item.orderStructure ?? item.order?.structure ?? '',
      cashAccountId: item.cashAccount.id,
      amountUzs: String(item.amountUzs),
      amountUsd: String(item.amountUsd),
      comment: item.comment ?? item.description ?? '',
    });
  }

  return (
    <>
      <PageTitle title={title} />
      <div className="mb-3 grid gap-2 md:grid-cols-3 xl:grid-cols-6">
        <Summary label="Приход UZS" value={money(incomeUzs)} />
        <Summary label="Расход UZS" value={money(expenseUzs)} />
        <Summary label="Остаток UZS" value={money(balanceUzs)} />
        <Summary label="Приход USD" value={money(incomeUsd, 'USD')} />
        <Summary label="Расход USD" value={money(expenseUsd, 'USD')} />
        <Summary label="Остаток USD" value={money(balanceUsd, 'USD')} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
        <section className="min-w-0 rounded border border-line bg-white">
          <div className="flex flex-wrap items-center gap-2 border-b border-line bg-panel p-2">
            <TextField type="date" value={filters.from} onChange={(event) => setFilters((current) => ({ ...current, from: event.target.value }))} aria-label={ru.finance.fromDate} />
            <TextField type="date" value={filters.to} onChange={(event) => setFilters((current) => ({ ...current, to: event.target.value }))} aria-label={ru.finance.toDate} />
            <SelectField value={filters.type} onChange={(event) => setFilters((current) => ({ ...current, type: event.target.value, movementTypeId: '' }))}>
              <option value="ALL">Все операции</option>
              <option value="INCOME">Приход</option>
              <option value="EXPENSE">Расход</option>
              <option value="EXCHANGE">Обмен</option>
            </SelectField>
            <SelectField value={filters.movementTypeId} onChange={(event) => setFilters((current) => ({ ...current, movementTypeId: event.target.value }))}>
              <option value="">Все типы движения</option>
              {filterMovements.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </SelectField>
            <SelectField value={filters.counterpartyId} onChange={(event) => setFilters((current) => ({ ...current, counterpartyId: event.target.value }))}>
              <option value="">Все контрагенты</option>
              {(dict?.counterparties ?? []).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </SelectField>
          </div>
          <div className="max-h-[70vh] overflow-auto">
            <table className="erp-table">
              <thead className="sticky top-0 z-[1]">
                <tr>
                  <th>Дата</th>
                  <th>Платеж</th>
                  <th>Тип движения</th>
                  <th>Статья расхода</th>
                  <th>Контрагент</th>
                  <th>Заказ</th>
                  <th>Структура заказа</th>
                  <th>Точка ДС</th>
                  <th>UZS</th>
                  <th>USD</th>
                  <th>Курс</th>
                  <th>Итого UZS</th>
                  <th>Итого USD</th>
                  <th>Комментарий</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {transactions.isLoading && <tr><td colSpan={15}>Загрузка...</td></tr>}
                {rows.map((item) => (
                  <tr key={item.id}>
                    <td>{shortDate(item.date)}</td>
                    <td>{transactionTypeRu[item.type]}</td>
                    <td>{item.movementType?.name ?? '-'}</td>
                    <td>{item.expenseArticle?.name ?? item.category?.name ?? '-'}</td>
                    <td>{item.counterparty?.name ?? '-'}</td>
                    <td>{item.order?.number ?? '-'}</td>
                    <td>{item.orderStructure ?? item.order?.structure ?? '-'}</td>
                    <td>{cashAccountTypeRu[item.cashAccount.type]}</td>
                    <td className="text-right">{money(item.amountUzs)}</td>
                    <td className="text-right">{money(item.amountUsd, 'USD')}</td>
                    <td className="text-right">{Number(item.rate).toLocaleString('ru-RU')}</td>
                    <td className="text-right font-medium">{money(item.totalUzs)}</td>
                    <td className="text-right font-medium">{money(item.totalUsd, 'USD')}</td>
                    <td>{item.comment ?? item.description ?? '-'}</td>
                    <td>
                      <div className="flex gap-2">
                        <button className="text-[var(--accent-text)]" type="button" onClick={() => editTransaction(item)}>Редактировать</button>
                        <button className="text-danger" type="button" onClick={() => window.confirm('Удалить операцию?') && deleteTransaction.mutate(item.id)}>Удалить</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <form onSubmit={submit} className="rounded border border-line bg-white">
          <div className="border-b border-line bg-panel px-3 py-2 text-sm font-semibold">
            {editingId ? 'Редактировать операцию' : 'Добавить операцию'}
          </div>
          <div className="grid gap-3 p-3">
            <TextField type="date" value={form.date} onChange={(event) => setFormField('date', event.target.value)} />
            <SelectField value={form.type} onChange={(event) => setForm((current) => ({ ...current, type: event.target.value as TransactionType, movementTypeId: '' }))}>
              <option value="INCOME">Приход</option>
              <option value="EXPENSE">Расход</option>
              <option value="EXCHANGE">Обмен</option>
            </SelectField>
            <SelectField value={form.movementTypeId} onChange={(event) => setFormField('movementTypeId', event.target.value)}>
              <option value="">Тип движения</option>
              {movements.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </SelectField>
            <SelectField value={form.expenseArticleId} onChange={(event) => setFormField('expenseArticleId', event.target.value)}>
              <option value="">Статья расхода</option>
              {(dict?.expenseArticles ?? []).map((item) => <option key={item.id} value={item.id}>{item.name} {item.groupName ? `- ${item.groupName}` : ''}</option>)}
            </SelectField>
            <SelectField value={form.counterpartyId} onChange={(event) => setFormField('counterpartyId', event.target.value)}>
              <option value="">Контрагент</option>
              {(dict?.counterparties ?? []).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </SelectField>
            <SelectField value={form.orderId} onChange={(event) => {
              const order = dict?.orders.find((item) => item.id === event.target.value);
              setForm((current) => ({ ...current, orderId: event.target.value, orderStructure: order?.structure ?? '' }));
            }}>
              <option value="">Заказ</option>
              {(dict?.orders ?? []).map((item) => <option key={item.id} value={item.id}>{item.number} - {item.name}</option>)}
            </SelectField>
            <TextField placeholder="Структура заказа" value={form.orderStructure} onChange={(event) => setFormField('orderStructure', event.target.value)} />
            <SelectField value={form.cashAccountId || accounts[0]?.id || ''} onChange={(event) => setFormField('cashAccountId', event.target.value)}>
              {accounts.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </SelectField>
            <div className="grid grid-cols-2 gap-2">
              <TextField type="number" min="0" step="0.01" value={form.amountUzs} onChange={(event) => setFormField('amountUzs', event.target.value)} placeholder="Сумма UZS" />
              <TextField type="number" min="0" step="0.01" value={form.amountUsd} onChange={(event) => setFormField('amountUsd', event.target.value)} placeholder="Сумма USD" />
            </div>
            <TextField placeholder="Комментарий" value={form.comment} onChange={(event) => setFormField('comment', event.target.value)} />
            <Button disabled={createTransaction.isPending || updateTransaction.isPending || accounts.length === 0} type="submit">
              <Plus size={16} />
              {editingId ? 'Сохранить' : 'Добавить'}
            </Button>
            {editingId && <button className="h-9 rounded border border-line" type="button" onClick={resetForm}>Отмена</button>}
          </div>
        </form>
      </div>
    </>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-line bg-white p-2">
      <div className="text-xs text-muted">{label}</div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}
