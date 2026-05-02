'use client';

import { SelectField, TextField } from '@/components/ui/field';
import { money, shortDate } from '@/lib/format';
import { useTransactions } from '@/lib/hooks';
import { ru, transactionTypeRu } from '@/lib/i18n';
import { useUiStore } from '@/store/ui-store';

export function TransactionTable() {
  const financeType = useUiStore((state) => state.financeType);
  const setFinanceType = useUiStore((state) => state.setFinanceType);
  const params = financeType === 'ALL' ? '?page=1&limit=100' : `?page=1&limit=100&type=${financeType}`;
  const { data, isLoading } = useTransactions(params);

  return (
    <section className="min-w-0 rounded border border-line bg-white">
      <div className="flex flex-wrap items-center gap-2 border-b border-line bg-panel p-2">
        <SelectField value={financeType} onChange={(event) => setFinanceType(event.target.value as typeof financeType)}>
          <option value="ALL">{ru.finance.allOperations}</option>
          <option value="INCOME">{transactionTypeRu.INCOME}</option>
          <option value="EXPENSE">{transactionTypeRu.EXPENSE}</option>
          <option value="EXCHANGE">{transactionTypeRu.EXCHANGE}</option>
        </SelectField>
        <TextField type="date" aria-label={ru.finance.fromDate} />
        <TextField type="date" aria-label={ru.finance.toDate} />
      </div>
      <div className="overflow-auto">
        <table className="erp-table">
          <thead>
            <tr>
              <th>{ru.table.date}</th>
              <th>{ru.table.type}</th>
              <th>{ru.table.account}</th>
              <th>{ru.table.counterparty}</th>
              <th>{ru.table.description}</th>
              <th>UZS</th>
              <th>USD</th>
              <th>{ru.table.rate}</th>
              <th>{ru.table.totalUzs}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={9}>{ru.common.loading}</td></tr>}
            {(data?.items ?? []).map((item) => (
              <tr key={item.id}>
                <td>{shortDate(item.date)}</td>
                <td>{transactionTypeRu[item.type]}</td>
                <td>{item.cashAccount.name}</td>
                <td>{item.counterparty?.name ?? ru.common.notSpecified}</td>
                <td>{item.description ?? ru.common.notSpecified}</td>
                <td className="text-right">{money(item.amountUzs)}</td>
                <td className="text-right">{money(item.amountUsd, 'USD')}</td>
                <td className="text-right">{Number(item.rate).toLocaleString('ru-RU')}</td>
                <td className="text-right font-medium">{money(item.signedTotalUzs)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
