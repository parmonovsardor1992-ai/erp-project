'use client';

import { PageTitle } from '@/components/ui/page-title';
import { money, shortDate } from '@/lib/format';
import { useSalary } from '@/lib/hooks';
import { ru } from '@/lib/i18n';

export default function SalaryPage() {
  const { data, isLoading } = useSalary();

  return (
    <>
      <PageTitle title={ru.nav.salary} />
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
            {(data ?? []).map((record) => (
              <tr key={record.id}>
                <td>{shortDate(record.period)}</td>
                <td>{record.employee.name}</td>
                <td>{record.position ?? '-'}</td>
                <td>{record.department?.name ?? '-'}</td>
                <td className="text-right">{money(record.startBalance)}</td>
                <td className="text-right">{money(record.accrued)}</td>
                <td className="text-right">{money(record.paid)}</td>
                <td className="text-right font-medium">{money(record.finalBalance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
