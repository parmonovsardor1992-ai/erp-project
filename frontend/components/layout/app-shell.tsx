'use client';

import {
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  Contact,
  CreditCard,
  Landmark,
  LayoutDashboard,
  Menu,
  Moon,
  Sun,
  Wallet,
  WalletCards,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode, useEffect } from 'react';
import { clsx } from 'clsx';
import { useUiStore } from '@/store/ui-store';
import { ru } from '@/lib/i18n';

const items = [
  { href: '/dashboard', label: ru.nav.dashboard, icon: LayoutDashboard },
  { href: '/cash', label: ru.nav.cash, icon: Wallet },
  { href: '/bank', label: ru.nav.bank, icon: Landmark },
  { href: '/card', label: ru.nav.card, icon: CreditCard },
  { href: '/orders', label: ru.nav.orders, icon: BriefcaseBusiness },
  { href: '/salary', label: ru.nav.salary, icon: BarChart3 },
  { href: '/salary-accruals', label: ru.nav.salaryAccruals, icon: WalletCards },
  { href: '/utility-accruals', label: ru.nav.utilityAccruals, icon: Building2 },
  { href: '/other-counterparties', label: ru.nav.counterparties, icon: Contact },
  { href: '/dictionaries', label: ru.nav.dictionaries, icon: BookOpen },
  { href: '/balances', label: ru.nav.cashBalances, icon: WalletCards },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const collapsed = useUiStore((state) => state.sidebarCollapsed);
  const toggle = useUiStore((state) => state.toggleSidebar);
  const theme = useUiStore((state) => state.theme);
  const setTheme = useUiStore((state) => state.setTheme);
  const toggleTheme = useUiStore((state) => state.toggleTheme);

  useEffect(() => {
    const saved = window.localStorage.getItem('erp-theme');
    if (saved === 'light' || saved === 'dark') {
      setTheme(saved);
    }
  }, [setTheme]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem('erp-theme', theme);
  }, [theme]);

  return (
    <div className="min-h-screen">
      <aside className={clsx('theme-soft theme-border fixed inset-y-0 left-0 border-r transition-all', collapsed ? 'w-16' : 'w-56')}>
        <div className="theme-border flex h-12 items-center gap-2 border-b px-3">
          <button aria-label="Свернуть меню" className="theme-surface theme-border grid h-8 w-8 place-items-center rounded border" onClick={toggle}>
            <Menu size={17} />
          </button>
          {!collapsed && <span className="font-semibold">{ru.appName}</span>}
        </div>
        <nav className="p-2">
          {items.map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'theme-muted-text mb-1 flex h-9 items-center gap-2 rounded px-2 text-sm',
                  active && 'bg-[var(--accent-soft)] text-[var(--accent-text)] ring-1 ring-[var(--border)]',
                )}
                title={item.label}
              >
                <Icon size={17} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className={clsx('transition-all', collapsed ? 'ml-16' : 'ml-56')}>
        <header className="theme-surface theme-border sticky top-0 z-10 flex h-12 items-center justify-between border-b px-4">
          <div className="text-sm font-semibold">{ru.workspace}</div>
          <div className="flex items-center gap-2">
            <div className="theme-muted-text text-xs">UZS / USD</div>
            <button
              aria-label={theme === 'light' ? 'Включить ночной режим' : 'Включить дневной режим'}
              className="theme-surface theme-border grid h-8 w-8 place-items-center rounded border"
              onClick={toggleTheme}
              title={theme === 'light' ? 'Ночной режим' : 'Дневной режим'}
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </button>
          </div>
        </header>
        <div className="p-4">{children}</div>
      </main>
    </div>
  );
}
