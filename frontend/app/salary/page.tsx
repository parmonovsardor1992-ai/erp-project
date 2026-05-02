'use client';

import { useMemo, useState } from 'react';
import { PageTitle } from '@/components/ui/page-title';
import { SelectField, TextField } from '@/components/ui/field';
import { money, shortDate } from '@/lib/format';
import { useDictionaries, useSalary } from '@/lib/hooks';
import { ru } from '@/lib/i18n';

export default function SalaryPage() {
  const [filters, setFilters] = useState({ period: '', employeeId: '' });
  const dictionaries = useDictionaries();
  const { data, isLoading } = useSalary();
  const rows = useMemo(() => {
    return (data ?? []).filter((record) => {
      const periodOk = filters.period ? String(record.period).startsWith(filters.period) : true;
      const employeeOk = filters.employeeId ? record.employee.id === filters.employeeId : true;
      return periodOk && employeeOk;
    });
  }, [data, filters]);

  return (
    <>
      <PageTitle title={ru.nav.salary} />
      <section className="mb-3 flex flex-wrap gap-2 rounded border border-line bg-white p-2">
        <TextField type="month" value={filters.period} onChange={(event) => setFilters((current) => ({ ...current, period: event.target.value }))} />
        <SelectField value={filters.employeeId} onChange={(event) => setFilters((current) => ({ ...current, employeeId: event.target.value }))}>
          <option value="">Все сотрудники</option>
          {(dictionaries.data?.employeesDetailed ?? []).map((item) => <option key={item.counterparty.id} value={item.counterparty.id}>{item.counterparty.name}</option>)}
        </SelectField>
      </section>
      <section className="overflow-auto rounded border border-line bg-white">
        <table className="erp-table">
          <thead>
            <tr>
              <th>{ru.table.period}</th>
              <th>{ru.table.employee}</th>
              <th>Должность</th>
              <th>Подразделение</th>
              <th>{ru.table.startBalance}</th>
              <th>{ru.table.accrued}</th>
              <th>{ru.table.paid}</th>
              <th>{ru.table.finalBalance}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={8}>{ru.common.loading}</td></tr>}
            {rows.map((record) => (
              <tr key={`${record.employee.id}-${record.period}`}>
                <td>{shortDate(record.period)}</td>
                <td>{record.employee.name}</td>
                <td>{record.position ?? '-'}</td>
                <td>{record.department?.name ?? '-'}</td>
                <td className="text-right">{money(Number(record.openingBalance ?? record.startBalance ?? 0))}</td>
                <td className="text-right">{money(Number(record.accrued ?? 0))}</td>
                <td className="text-right">{money(Number(record.paid ?? 0))}</td>
                <td className="text-right font-medium">{money(Number(record.closingBalance ?? record.finalBalance ?? 0))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
