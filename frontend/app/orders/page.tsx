'use client';

import { FormEvent, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { SelectField, TextField } from '@/components/ui/field';
import { PageTitle } from '@/components/ui/page-title';
import { money, shortDate } from '@/lib/format';
import { useCreateOrder, useDeleteOrder, useDictionaries, useOrders, useUpdateOrder } from '@/lib/hooks';
import { orderStatusRu, ru } from '@/lib/i18n';
import { Order } from '@/lib/types';

const initialForm = {
  number: '',
  counterpartyId: '',
  name: '',
  structure: '',
  currencyCode: 'UZS',
  totalAmount: '0',
  structureAmount: '0',
  status: 'NEW',
  startDate: new Date().toISOString().slice(0, 10),
  endDate: '',
  amountUzs: '0',
  amountUsd: '0',
};

export default function OrdersPage() {
  const [filters, setFilters] = useState({ customerId: '', dateFrom: '', dateTo: '', search: '' });
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const dictionaries = useDictionaries();
  const params = useMemo(() => {
    const search = new URLSearchParams();
    if (filters.customerId) search.set('customerId', filters.customerId);
    if (filters.dateFrom) search.set('dateFrom', filters.dateFrom);
    if (filters.dateTo) search.set('dateTo', filters.dateTo);
    if (filters.search) search.set('search', filters.search);
    return search.size ? `?${search.toString()}` : '';
  }, [filters]);
  const { data, isLoading } = useOrders(params);
  const create = useCreateOrder();
  const update = useUpdateOrder();
  const remove = useDeleteOrder();

  function submit(event: FormEvent) {
    event.preventDefault();
    const body = {
      ...form,
      endDate: form.endDate || undefined,
      totalAmount: Number(form.totalAmount),
      structureAmount: Number(form.structureAmount),
      amountUzs: Number(form.amountUzs),
      amountUsd: Number(form.amountUsd),
    };
    if (editingId) {
      update.mutate({ id: editingId, body }, { onSuccess: reset });
    } else {
      create.mutate(body, { onSuccess: reset });
    }
  }

  function edit(order: Order) {
    setEditingId(order.id);
    setForm({
      number: order.number,
      counterpartyId: order.counterparty.id,
      name: order.name,
      structure: order.structure ?? '',
      currencyCode: order.currencyCode,
      totalAmount: String(order.totalAmount),
      structureAmount: String(order.structureAmount),
      status: order.status,
      startDate: order.startDate.slice(0, 10),
      endDate: order.endDate?.slice(0, 10) ?? '',
      amountUzs: String(order.amountUzs),
      amountUsd: String(order.amountUsd),
    });
  }

  function reset() {
    setEditingId(null);
    setForm(initialForm);
  }

  return (
    <>
      <PageTitle title={ru.nav.orders} />
      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <section className="overflow-auto rounded border border-line bg-white">
          <div className="flex flex-wrap gap-2 border-b border-line bg-panel p-2">
            <SelectField value={filters.customerId} onChange={(event) => setFilters((current) => ({ ...current, customerId: event.target.value }))}>
              <option value="">Все покупатели</option>
              {(dictionaries.data?.customers ?? []).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </SelectField>
            <TextField type="date" value={filters.dateFrom} onChange={(event) => setFilters((current) => ({ ...current, dateFrom: event.target.value }))} />
            <TextField type="date" value={filters.dateTo} onChange={(event) => setFilters((current) => ({ ...current, dateTo: event.target.value }))} />
            <TextField placeholder="Поиск заказа" value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} />
          </div>
          <table className="erp-table">
            <thead>
              <tr>
                <th>{ru.table.number}</th>
                <th>{ru.table.customer}</th>
                <th>Наименование заказа</th>
                <th>{ru.table.structure}</th>
                <th>Валюта</th>
                <th>{ru.table.status}</th>
                <th>{ru.table.startDate}</th>
                <th>Дата конец</th>
                <th>Общая сумма</th>
                <th>Сумма по структурам</th>
                <th>Оплачено</th>
                <th>Долг / переплата</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={13}>{ru.common.loading}</td>
                </tr>
              )}
              {(data ?? []).map((order) => {
                const debt = Number(order.orderDebt ?? 0);
                return (
                  <tr key={order.id}>
                    <td>{order.number}</td>
                    <td>{order.counterparty.name}</td>
                    <td>{order.name}</td>
                    <td>{order.structure}</td>
                    <td>{order.currencyCode}</td>
                    <td>{orderStatusRu[order.status] ?? order.status}</td>
                    <td>{shortDate(order.startDate)}</td>
                    <td>{order.endDate ? shortDate(order.endDate) : '-'}</td>
                    <td className="text-right">{money(order.totalAmount, order.currencyCode)}</td>
                    <td className="text-right">{money(order.structureAmount, order.currencyCode)}</td>
                    <td className="text-right">{money(Number(order.paidAmount ?? 0), order.currencyCode)}</td>
                    <td className="text-right font-medium">
                      {debt < 0 ? `Переплата ${money(Math.abs(debt), order.currencyCode)}` : money(debt, order.currencyCode)}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button className="text-[var(--accent-text)]" type="button" onClick={() => edit(order)}>
                          Редактировать
                        </button>
                        <button className="text-danger" type="button" onClick={() => window.confirm('Удалить заказ?') && remove.mutate(order.id)}>
                          Удалить
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        <form onSubmit={submit} className="rounded border border-line bg-white">
          <div className="border-b border-line bg-panel px-3 py-2 text-sm font-semibold">{editingId ? 'Редактировать заказ' : 'Добавить заказ'}</div>
          <div className="grid gap-3 p-3">
            <TextField placeholder="Номер" value={form.number} onChange={(event) => setForm((current) => ({ ...current, number: event.target.value }))} />
            <SelectField value={form.counterpartyId} onChange={(event) => setForm((current) => ({ ...current, counterpartyId: event.target.value }))}>
              <option value="">Покупатель</option>
              {(dictionaries.data?.customers ?? []).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </SelectField>
            <TextField placeholder="Наименование заказа" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
            <TextField placeholder="Структура заказа" value={form.structure} onChange={(event) => setForm((current) => ({ ...current, structure: event.target.value }))} />
            <div className="grid grid-cols-2 gap-2">
              <TextField type="date" value={form.startDate} onChange={(event) => setForm((current) => ({ ...current, startDate: event.target.value }))} />
              <TextField type="date" value={form.endDate} onChange={(event) => setForm((current) => ({ ...current, endDate: event.target.value }))} />
            </div>
            <SelectField value={form.currencyCode} onChange={(event) => setForm((current) => ({ ...current, currencyCode: event.target.value }))}>
              <option value="UZS">UZS</option>
              <option value="USD">USD</option>
            </SelectField>
            <TextField type="number" min="0" step="0.01" placeholder="Общая сумма" value={form.totalAmount} onChange={(event) => setForm((current) => ({ ...current, totalAmount: event.target.value }))} />
            <TextField type="number" min="0" step="0.01" placeholder="Сумма по структурам" value={form.structureAmount} onChange={(event) => setForm((current) => ({ ...current, structureAmount: event.target.value }))} />
            <SelectField value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}>
              {Object.entries(orderStatusRu).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </SelectField>
            <Button disabled={create.isPending || update.isPending || !form.counterpartyId || !form.number} type="submit">
              {editingId ? 'Сохранить' : 'Добавить'}
            </Button>
            {editingId && (
              <button className="h-9 rounded border border-line" type="button" onClick={reset}>
                Отмена
              </button>
            )}
          </div>
        </form>
      </div>
    </>
  );
}
