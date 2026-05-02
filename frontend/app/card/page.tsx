import { MoneyJournal } from '@/features/finance/money-journal';
import { ru } from '@/lib/i18n';

export default function CardPage() {
  return <MoneyJournal accountType="CARD" title={ru.nav.card} />;
}
