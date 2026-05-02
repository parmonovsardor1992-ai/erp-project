import { MoneyJournal } from '@/features/finance/money-journal';
import { ru } from '@/lib/i18n';

export default function CashPage() {
  return <MoneyJournal accountType="CASH" title={ru.nav.cash} />;
}
