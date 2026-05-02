'use client';

import { PageTitle } from '@/components/ui/page-title';
import { money, shortDate } from '@/lib/format';
import { useOrders } from '@/lib/hooks';
import { orderStatusRu, ru } from '@/lib/i18n';

export default function OrdersPage() {
  const { data, isLoading } = useOrders();

  return (
    <>
      <PageTitle title={ru.nav.orders} />
      <section className="overflow-auto rounded border border-line bg-white">
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
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={9}>{ru.common.loading}</td></tr>}
            {(data ?? []).map((order) => (
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
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
