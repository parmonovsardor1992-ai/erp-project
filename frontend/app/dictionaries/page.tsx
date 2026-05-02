'use client';

import { PageTitle } from '@/components/ui/page-title';
import { shortDate } from '@/lib/format';
import { cashAccountTypeRu, ru, transactionTypeRu } from '@/lib/i18n';
import { useDictionaries } from '@/lib/hooks';

export default function DictionariesPage() {
  const { data, isLoading } = useDictionaries();

  return (
    <>
      <PageTitle title={ru.nav.dictionaries} />
      {isLoading && <div className="rounded border border-line bg-white p-3 text-sm">{ru.common.loading}</div>}
      {data && (
        <div className="grid gap-4 xl:grid-cols-2">
          <DictionaryTable title="Покупатели" rows={data.customers.map((x) => [x.name, x.phone ?? '-'])} headers={['Название', 'Телефон']} />
          <DictionaryTable title="Поставщики" rows={data.suppliers.map((x) => [x.name, x.phone ?? '-'])} headers={['Название', 'Телефон']} />
          <DictionaryTable title="Готовая продукция" rows={data.products.map((x) => [x.name, x.unit ?? '-'])} headers={['Название', 'Ед.']} />
          <DictionaryTable title="Валюты" rows={data.currencies.map((x) => [x.code, x.name])} headers={['Код', 'Название']} />
          <DictionaryTable title="Курсы валют по датам" rows={data.currencyRates.map((x) => [shortDate(x.date), x.code, x.rateToUzs])} headers={['Дата', 'Валюта', 'Курс']} />
          <DictionaryTable title="Тип платежа" rows={data.paymentTypes.map((x) => [x.name])} headers={['Название']} />
          <DictionaryTable title="Точки ДС" rows={data.cashAccounts.map((x) => [x.name, cashAccountTypeRu[x.type]])} headers={['Название', 'Тип']} />
          <DictionaryTable title="Тип движения Приход" rows={data.movementTypes.filter((x) => x.paymentType === 'INCOME').map((x) => [x.name, transactionTypeRu[x.paymentType]])} headers={['Название', 'Тип']} />
          <DictionaryTable title="Тип движения Расход" rows={data.movementTypes.filter((x) => x.paymentType === 'EXPENSE').map((x) => [x.name, transactionTypeRu[x.paymentType]])} headers={['Название', 'Тип']} />
          <DictionaryTable title="Тип движения Обмен" rows={data.movementTypes.filter((x) => x.paymentType === 'EXCHANGE').map((x) => [x.name, transactionTypeRu[x.paymentType]])} headers={['Название', 'Тип']} />
          <DictionaryTable title="Статьи расходов" rows={data.expenseCategories.map((x) => [x.name])} headers={['Название']} />
          <DictionaryTable title="Подразделения" rows={data.departments.map((x) => [x.name])} headers={['Название']} />
        </div>
      )}
    </>
  );
}

function DictionaryTable({ title, headers, rows }: { title: string; headers: string[]; rows: string[][] }) {
  return (
    <section className="overflow-auto rounded border border-line bg-white">
      <div className="border-b border-line bg-panel px-3 py-2 text-sm font-semibold">{title}</div>
      <table className="erp-table">
        <thead>
          <tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={`${title}-${index}`}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
