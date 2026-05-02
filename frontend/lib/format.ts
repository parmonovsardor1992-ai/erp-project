export function money(value: string | number | null | undefined, currency = 'UZS') {
  const number = Number(value ?? 0);
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency,
    maximumFractionDigits: currency === 'UZS' ? 0 : 2,
  }).format(number);
}

export function shortDate(value: string) {
  return new Intl.DateTimeFormat('ru-RU').format(new Date(value));
}
