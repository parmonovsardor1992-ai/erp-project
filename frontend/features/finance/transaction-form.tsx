'use client';

import { FormEvent, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SelectField, TextField } from '@/components/ui/field';
import { useCreateTransaction } from '@/lib/hooks';
import { ru, transactionTypeRu } from '@/lib/i18n';

const initial = {
  date: new Date().toISOString().slice(0, 10),
  type: 'INCOME',
  cashAccountId: '',
  counterpartyId: '',
  categoryId: '',
  description: '',
  amountUzs: '0',
  amountUsd: '0',
};

export function TransactionForm() {
  const [form, setForm] = useState(initial);
  const mutation = useCreateTransaction();

  function setField(name: string, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    mutation.mutate({
      ...form,
      amountUzs: Number(form.amountUzs),
      amountUsd: Number(form.amountUsd),
      categoryId: form.categoryId || undefined,
      counterpartyId: form.counterpartyId || undefined,
    });
  }

  return (
    <form onSubmit={submit} className="rounded border border-line bg-white">
      <div className="border-b border-line bg-panel px-3 py-2 text-sm font-semibold">{ru.finance.addTransaction}</div>
      <div className="grid gap-3 p-3">
        <TextField type="date" value={form.date} onChange={(event) => setField('date', event.target.value)} />
        <SelectField value={form.type} onChange={(event) => setField('type', event.target.value)}>
          <option value="INCOME">{transactionTypeRu.INCOME}</option>
          <option value="EXPENSE">{transactionTypeRu.EXPENSE}</option>
          <option value="EXCHANGE">{transactionTypeRu.EXCHANGE}</option>
        </SelectField>
        <TextField placeholder={ru.finance.cashAccountId} value={form.cashAccountId} onChange={(event) => setField('cashAccountId', event.target.value)} />
        <TextField placeholder={ru.finance.counterpartyId} value={form.counterpartyId} onChange={(event) => setField('counterpartyId', event.target.value)} />
        <TextField placeholder={ru.finance.categoryId} value={form.categoryId} onChange={(event) => setField('categoryId', event.target.value)} />
        <TextField placeholder={ru.finance.description} value={form.description} onChange={(event) => setField('description', event.target.value)} />
        <div className="grid grid-cols-2 gap-2">
          <TextField type="number" min="0" step="0.01" value={form.amountUzs} onChange={(event) => setField('amountUzs', event.target.value)} />
          <TextField type="number" min="0" step="0.01" value={form.amountUsd} onChange={(event) => setField('amountUsd', event.target.value)} />
        </div>
        <Button disabled={mutation.isPending} type="submit">
          <Plus size={16} />
          {ru.finance.add}
        </Button>
      </div>
    </form>
  );
}
