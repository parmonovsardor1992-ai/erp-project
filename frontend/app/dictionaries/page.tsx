'use client';

import { FormEvent, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { SelectField, TextField } from '@/components/ui/field';
import { PageTitle } from '@/components/ui/page-title';
import { useCreateDirectoryItem, useDeleteDirectoryItem, useDirectoryList, useDictionaries, useUpdateDirectoryItem } from '@/lib/hooks';
import { ru } from '@/lib/i18n';

type Field = {
  name: string;
  label: string;
  type?: 'text' | 'number' | 'date' | 'select';
  options?: Array<{ value: string; label: string }>;
};

const directories = [
  { key: 'customers', label: 'Покупатели' },
  { key: 'suppliers', label: 'Поставщики' },
  { key: 'employees', label: 'Сотрудники' },
  { key: 'products', label: 'Готовая продукция' },
  { key: 'currencies', label: 'Валюты' },
  { key: 'currency-rates', label: 'Курсы валют' },
  { key: 'cash-accounts', label: 'Точки ДС' },
  { key: 'movement-types', label: 'Типы движения' },
  { key: 'expense-articles', label: 'Статьи расходов' },
  { key: 'departments', label: 'Подразделения' },
  { key: 'settings', label: 'Настройки' },
] as const;

type DirectoryKey = typeof directories[number]['key'];

const initialByDirectory: Record<DirectoryKey, Record<string, string>> = {
  customers: { name: '', phone: '', taxId: '' },
  suppliers: { name: '', phone: '', taxId: '' },
  employees: { name: '', phone: '', taxId: '', position: 'Сотрудник', departmentId: '' },
  products: { name: '', unit: 'шт' },
  currencies: { code: 'UZS', name: '' },
  'currency-rates': { code: 'USD', date: new Date().toISOString().slice(0, 10), rateToUzs: '12600' },
  'cash-accounts': { name: '', type: 'CASH', currencyCode: 'UZS' },
  'movement-types': { name: '', paymentType: 'INCOME' },
  'expense-articles': { name: '', groupName: '', section: 'GENERAL', defaultCurrency: '' },
  departments: { name: '' },
  settings: { key: '', value: '' },
};

export default function DictionariesPage() {
  const [directory, setDirectory] = useState<DirectoryKey>('customers');
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, string>>(initialByDirectory.customers);
  const dictionaries = useDictionaries();
  const list = useDirectoryList(directory, search);
  const create = useCreateDirectoryItem(directory);
  const update = useUpdateDirectoryItem(directory);
  const remove = useDeleteDirectoryItem(directory);

  const fields = useMemo(() => buildFields(directory, dictionaries.data), [directory, dictionaries.data]);
  const rows = (list.data ?? []) as Array<Record<string, unknown>>;

  function changeDirectory(value: DirectoryKey) {
    setDirectory(value);
    setEditingId(null);
    setForm(initialByDirectory[value]);
  }

  function edit(row: Record<string, unknown>) {
    const next = { ...initialByDirectory[directory] };
    for (const field of fields) {
      const value = row[field.name];
      next[field.name] = field.type === 'date' && typeof value === 'string' ? value.slice(0, 10) : String(value ?? '');
    }
    setEditingId(String(row.id));
    setForm(next);
  }

  function reset() {
    setEditingId(null);
    setForm(initialByDirectory[directory]);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const body = normalizeBody(directory, form);
    if (editingId) {
      update.mutate({ id: editingId, body }, { onSuccess: reset });
    } else {
      create.mutate(body, { onSuccess: reset });
    }
  }

  function deleteRow(row: Record<string, unknown>) {
    const label = displayRow(directory, row);
    if (window.confirm(`Удалить "${label}"?`)) {
      remove.mutate(String(row.id));
    }
  }

  return (
    <>
      <PageTitle title={ru.nav.dictionaries} />
      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <section className="rounded border border-line bg-white">
          <div className="flex flex-wrap items-center gap-2 border-b border-line bg-panel p-2">
            <SelectField value={directory} onChange={(event) => changeDirectory(event.target.value as DirectoryKey)}>
              {directories.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}
            </SelectField>
            <TextField placeholder="Поиск" value={search} onChange={(event) => setSearch(event.target.value)} />
          </div>
          <div className="max-h-[72vh] overflow-auto">
            <table className="erp-table">
              <thead className="sticky top-0 z-[1]">
                <tr>
                  {fields.map((field) => <th key={field.name}>{field.label}</th>)}
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {list.isLoading && <tr><td colSpan={fields.length + 1}>{ru.common.loading}</td></tr>}
                {rows.map((row) => (
                  <tr key={String(row.id)}>
                    {fields.map((field) => <td key={field.name}>{formatCell(row[field.name], field, dictionaries.data)}</td>)}
                    <td>
                      <div className="flex gap-2">
                        <button className="text-[var(--accent-text)]" type="button" onClick={() => edit(row)}>Редактировать</button>
                        <button className="text-danger" type="button" onClick={() => deleteRow(row)}>Удалить</button>
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
            {editingId ? 'Редактировать' : 'Добавить'}
          </div>
          <div className="grid gap-3 p-3">
            {fields.map((field) => (
              field.type === 'select' ? (
                <SelectField key={field.name} value={form[field.name] ?? ''} onChange={(event) => setForm((current) => ({ ...current, [field.name]: event.target.value }))}>
                  {(field.options ?? []).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </SelectField>
              ) : (
                <TextField
                  key={field.name}
                  type={field.type ?? 'text'}
                  placeholder={field.label}
                  value={form[field.name] ?? ''}
                  onChange={(event) => setForm((current) => ({ ...current, [field.name]: event.target.value }))}
                />
              )
            ))}
            <Button disabled={create.isPending || update.isPending} type="submit">{editingId ? 'Сохранить' : 'Добавить'}</Button>
            {editingId && <button className="h-9 rounded border border-line" type="button" onClick={reset}>Отмена</button>}
          </div>
        </form>
      </div>
    </>
  );
}

function buildFields(directory: DirectoryKey, dictionaries?: { departments?: Array<{ id: string; name: string }> }): Field[] {
  const paymentTypes = [
    { value: 'INCOME', label: 'Приход' },
    { value: 'EXPENSE', label: 'Расход' },
    { value: 'EXCHANGE', label: 'Обмен' },
  ];
  const currencies = [
    { value: '', label: 'Валюта по умолчанию' },
    { value: 'UZS', label: 'UZS' },
    { value: 'USD', label: 'USD' },
  ];
  const map: Record<DirectoryKey, Field[]> = {
    customers: commonCounterpartyFields(),
    suppliers: commonCounterpartyFields(),
    employees: [
      ...commonCounterpartyFields(),
      { name: 'position', label: 'Должность' },
      {
        name: 'departmentId',
        label: 'Подразделение',
        type: 'select',
        options: [
          { value: '', label: 'Без подразделения' },
          ...(dictionaries?.departments ?? []).map((department) => ({ value: department.id, label: department.name })),
        ],
      },
    ],
    products: [{ name: 'name', label: 'Название' }, { name: 'unit', label: 'Ед. изм.' }],
    currencies: [{ name: 'code', label: 'Код', type: 'select', options: [{ value: 'UZS', label: 'UZS' }, { value: 'USD', label: 'USD' }] }, { name: 'name', label: 'Название' }],
    'currency-rates': [{ name: 'date', label: 'Дата', type: 'date' }, { name: 'code', label: 'Валюта', type: 'select', options: currencies.filter((item) => item.value) }, { name: 'rateToUzs', label: 'Курс', type: 'number' }],
    'cash-accounts': [{ name: 'name', label: 'Название' }, { name: 'type', label: 'Тип', type: 'select', options: [{ value: 'CASH', label: 'Касса' }, { value: 'BANK', label: 'Банк' }, { value: 'CARD', label: 'Карта' }] }, { name: 'currencyCode', label: 'Валюта', type: 'select', options: currencies.filter((item) => item.value) }],
    'movement-types': [{ name: 'name', label: 'Название' }, { name: 'paymentType', label: 'Тип платежа', type: 'select', options: paymentTypes }],
    'expense-articles': [{ name: 'name', label: 'Название' }, { name: 'groupName', label: 'Группа' }, { name: 'section', label: 'Раздел', type: 'select', options: [{ value: 'GENERAL', label: 'Статьи расходов' }, { value: 'SUPPLY', label: 'Расходы снабжение' }, { value: 'UTILITY', label: 'Аренда/Коммуналка' }] }, { name: 'defaultCurrency', label: 'Валюта', type: 'select', options: currencies }],
    departments: [{ name: 'name', label: 'Название' }],
    settings: [{ name: 'key', label: 'Ключ' }, { name: 'value', label: 'Значение' }],
  };
  return map[directory];
}

function commonCounterpartyFields(): Field[] {
  return [{ name: 'name', label: 'Название' }, { name: 'phone', label: 'Телефон' }, { name: 'taxId', label: 'ИНН' }];
}

function normalizeBody(directory: DirectoryKey, form: Record<string, string>) {
  const body: Record<string, string | number | boolean | null> = {};
  for (const [key, value] of Object.entries(form)) {
    if (value === '') continue;
    body[key] = key === 'rateToUzs' ? Number(value) : value;
  }
  if (directory === 'products') body.isActive = true;
  if (directory === 'cash-accounts') body.isActive = true;
  if (directory === 'expense-articles' && !body.defaultCurrency) body.defaultCurrency = null;
  return body;
}

function formatCell(value: unknown, field: Field, dictionaries: unknown) {
  if (value == null || value === '') return '-';
  if (field.type === 'date' && typeof value === 'string') return new Date(value).toLocaleDateString('ru-RU');
  const payload = dictionaries as { paymentTypes?: Array<{ id: string; name: string }>; cashAccountTypes?: Array<{ id: string; name: string }> } | undefined;
  if (field.name === 'paymentType') return payload?.paymentTypes?.find((item) => item.id === value)?.name ?? String(value);
  if (field.name === 'type') return payload?.cashAccountTypes?.find((item) => item.id === value)?.name ?? String(value);
  if (field.name === 'departmentId') {
    const departments = (dictionaries as { departments?: Array<{ id: string; name: string }> } | undefined)?.departments ?? [];
    return departments.find((item) => item.id === value)?.name ?? String(value);
  }
  return String(value);
}

function displayRow(directory: DirectoryKey, row: Record<string, unknown>) {
  if (directory === 'currency-rates') return `${row.code} ${row.date}`;
  if (directory === 'settings') return String(row.key ?? '');
  return String(row.name ?? row.code ?? '');
}
