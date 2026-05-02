import { MoneyJournal } from '@/features/finance/money-journal';
import { ru } from '@/lib/i18n';

export default function BankPage() {
  return <MoneyJournal accountType="BANK" title={ru.nav.bank} />;
}
