'use client';

import { PageTitle } from '@/components/ui/page-title';
import { money } from '@/lib/format';
import { useCounterparties } from '@/lib/hooks';
import { counterpartyTypeRu, ru } from '@/lib/i18n';

export default function CounterpartiesPage() {
  const { data, isLoading } = useCounterparties();

  return (
    <>
      <PageTitle title={ru.nav.counterparties} />
      <section className="overflow-auto rounded border border-line bg-white">
        <table className="erp-table">
          <thead>
            <tr>
              <th>{ru.table.name}</th>
              <th>{ru.table.type}</th>
              <th>{ru.table.phone}</th>
              <th>{ru.table.taxId}</th>
              <th>{ru.table.debt}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={5}>{ru.common.loading}</td></tr>}
            {(data ?? []).map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{counterpartyTypeRu[item.type]}</td>
                <td>{item.phone ?? ru.common.notSpecified}</td>
                <td>{item.taxId ?? ru.common.notSpecified}</td>
                <td className="text-right font-medium">{money(item.debtUzs)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
