'use client';

import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { SelectField, TextField } from '@/components/ui/field';
import { PageTitle } from '@/components/ui/page-title';
import { money, shortDate } from '@/lib/format';
import { ru } from '@/lib/i18n';
import { useCreateSalaryAccrual, useDictionaries, useSalaryAccruals } from '@/lib/hooks';

export default function SalaryAccrualsPage() {
  const { data, isLoading } = useSalaryAccruals();
  const dictionaries = useDictionaries();
  const create = useCreateSalaryAccrual();
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), employeeId: '', accrualMethod: 'Оклад', currencyCode: 'UZS', amount: '0', comment: '' });
  const employee = dictionaries.data?.employeesDetailed?.find((item) => item.id === form.employeeId);

  function submit(event: FormEvent) {
    event.preventDefault();
    create.mutate({ ...form, amount: Number(form.amount) });
  }

  return (
    <>
      <PageTitle title={ru.nav.salaryAccruals} />
      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <section className="overflow-auto rounded border border-line bg-white">
          <table className="erp-table">
            <thead>
              <tr>
                <th>{ru.table.date}</th>
                <th>{ru.table.employee}</th>
                <th>Должность</th>
                <th>Подразделение</th>
                <th>Метод</th>
                <th>Валюта</th>
                <th>Сумма</th>
                <th>{ru.table.rate}</th>
                <th>{ru.table.amountUzs}</th>
                <th>{ru.table.amountUsd}</th>
                <th>Комментарий</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && <tr><td colSpan={11}>{ru.common.loading}</td></tr>}
              {(data ?? []).map((row) => (
                <tr key={row.id}>
                  <td>{shortDate(row.date)}</td>
                  <td>{row.employee.counterparty.name}</td>
                  <td>{row.position}</td>
                  <td>{row.department?.name ?? '-'}</td>
                  <td>{row.accrualMethod}</td>
                  <td>{row.currencyCode}</td>
                  <td className="text-right">{money(row.amount, row.currencyCode)}</td>
                  <td className="text-right">{Number(row.rate).toLocaleString('ru-RU')}</td>
                  <td className="text-right">{money(row.amountUzs)}</td>
                  <td className="text-right">{money(row.amountUsd, 'USD')}</td>
                  <td>{row.comment ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <form onSubmit={submit} className="rounded border border-line bg-white">
          <div className="border-b border-line bg-panel px-3 py-2 text-sm font-semibold">Добавить начисление ЗП</div>
          <div className="grid gap-3 p-3">
            <TextField type="date" value={form.date} onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))} />
            <SelectField value={form.employeeId} onChange={(event) => setForm((current) => ({ ...current, employeeId: event.target.value }))}>
              <option value="">Сотрудник</option>
              {(dictionaries.data?.employeesDetailed ?? []).map((item) => <option key={item.id} value={item.id}>{item.counterparty.name}</option>)}
            </SelectField>
            <TextField value={employee?.position ?? ''} readOnly placeholder="Должность" />
            <TextField value={employee?.department?.name ?? ''} readOnly placeholder="Подразделение" />
            <TextField value={form.accrualMethod} onChange={(event) => setForm((current) => ({ ...current, accrualMethod: event.target.value }))} placeholder="Метод начисления" />
            <SelectField value={form.currencyCode} onChange={(event) => setForm((current) => ({ ...current, currencyCode: event.target.value }))}>
              <option value="UZS">UZS</option>
              <option value="USD">USD</option>
            </SelectField>
            <TextField type="number" min="0" step="0.01" value={form.amount} onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))} />
            <TextField value={form.comment} onChange={(event) => setForm((current) => ({ ...current, comment: event.target.value }))} placeholder="Комментарий" />
            <Button disabled={create.isPending || !form.employeeId} type="submit">{ru.finance.save}</Button>
          </div>
        </form>
      </div>
    </>
  );
}
