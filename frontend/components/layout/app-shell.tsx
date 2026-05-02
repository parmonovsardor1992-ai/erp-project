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
  LockKeyhole,
  LogOut,
  Menu,
  Moon,
  Sun,
  Users,
  Wallet,
  WalletCards,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';
import { clsx } from 'clsx';
import { api } from '@/lib/api';
import { ru } from '@/lib/i18n';
import { UserRole } from '@/lib/types';
import { useAuthStore } from '@/store/auth-store';
import { useUiStore } from '@/store/ui-store';

const items = [
  { href: '/dashboard', label: ru.nav.dashboard, icon: LayoutDashboard, roles: ['ADMIN', 'ACCOUNTANT', 'MANAGER', 'VIEWER'] },
  { href: '/cash', label: ru.nav.cash, icon: Wallet, roles: ['ADMIN', 'ACCOUNTANT'] },
  { href: '/bank', label: ru.nav.bank, icon: Landmark, roles: ['ADMIN', 'ACCOUNTANT'] },
  { href: '/card', label: ru.nav.card, icon: CreditCard, roles: ['ADMIN', 'ACCOUNTANT'] },
  { href: '/exchanges', label: ru.nav.exchanges, icon: WalletCards, roles: ['ADMIN', 'ACCOUNTANT'] },
  { href: '/orders', label: ru.nav.orders, icon: BriefcaseBusiness, roles: ['ADMIN', 'MANAGER'] },
  { href: '/salary', label: ru.nav.salary, icon: BarChart3, roles: ['ADMIN', 'ACCOUNTANT'] },
  { href: '/salary-accruals', label: ru.nav.salaryAccruals, icon: WalletCards, roles: ['ADMIN', 'ACCOUNTANT'] },
  { href: '/utility-accruals', label: ru.nav.utilityAccruals, icon: Building2, roles: ['ADMIN', 'ACCOUNTANT'] },
  { href: '/other-counterparties', label: ru.nav.counterparties, icon: Contact, roles: ['ADMIN', 'ACCOUNTANT', 'MANAGER'] },
  { href: '/dictionaries', label: ru.nav.dictionaries, icon: BookOpen, roles: ['ADMIN', 'ACCOUNTANT', 'MANAGER'] },
  { href: '/balances', label: ru.nav.cashBalances, icon: WalletCards, roles: ['ADMIN', 'ACCOUNTANT', 'VIEWER'] },
  { href: '/period-locks', label: 'Закрытие периода', icon: LockKeyhole, roles: ['ADMIN', 'ACCOUNTANT'] },
  { href: '/users', label: 'Пользователи', icon: Users, roles: ['ADMIN'] },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const collapsed = useUiStore((state) => state.sidebarCollapsed);
  const toggle = useUiStore((state) => state.toggleSidebar);
  const theme = useUiStore((state) => state.theme);
  const setTheme = useUiStore((state) => state.setTheme);
  const toggleTheme = useUiStore((state) => state.toggleTheme);
  const user = useAuthStore((state) => state.user);
  const initialized = useAuthStore((state) => state.initialized);
  const hydrate = useAuthStore((state) => state.hydrate);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    hydrate();
    const saved = window.localStorage.getItem('erp-theme');
    if (saved === 'light' || saved === 'dark') {
      setTheme(saved);
    }
  }, [hydrate, setTheme]);

  useEffect(() => {
    if (!initialized) return;
    if (!user && !pathname.startsWith('/login')) {
      router.replace('/login');
    }
    if (user && pathname.startsWith('/login')) {
      router.replace('/dashboard');
    }
  }, [initialized, pathname, router, user]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem('erp-theme', theme);
  }, [theme]);

  if (pathname.startsWith('/login')) {
    return <div className="min-h-screen">{children}</div>;
  }

  if (!initialized || !user) {
    return <div className="grid min-h-screen place-items-center text-sm text-[var(--muted-text)]">Загрузка...</div>;
  }

  const visibleItems = items.filter((item) => item.roles.includes(user.role));
  const currentItem = items.find((item) => pathname.startsWith(item.href));
  const hasAccess = !currentItem || currentItem.roles.includes(user.role);

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
          {visibleItems.map((item) => {
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
            <div className="theme-muted-text hidden text-xs sm:block">
              {user.fullName} · {roleLabel(user.role)}
            </div>
            <div className="theme-muted-text text-xs">UZS / USD</div>
            <button
              aria-label={theme === 'light' ? 'Включить ночной режим' : 'Включить дневной режим'}
              className="theme-surface theme-border grid h-8 w-8 place-items-center rounded border"
              onClick={toggleTheme}
              title={theme === 'light' ? 'Ночной режим' : 'Дневной режим'}
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </button>
            <button
              aria-label="Выйти"
              className="theme-surface theme-border grid h-8 w-8 place-items-center rounded border"
              onClick={async () => {
                const refreshToken = window.localStorage.getItem('erp-refresh-token');
                if (refreshToken) {
                  try {
                    await api.logout(refreshToken);
                  } catch {
                    // Local logout must still work even if the server session is already gone.
                  }
                }
                logout();
                router.replace('/login');
              }}
              title="Выйти"
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>
        <div className="p-4">{hasAccess ? children : <div className="theme-surface theme-border rounded border p-6">Нет доступа</div>}</div>
      </main>
    </div>
  );
}

function roleLabel(role: UserRole) {
  const labels: Record<UserRole, string> = {
    ADMIN: 'Администратор',
    ACCOUNTANT: 'Бухгалтер',
    MANAGER: 'Менеджер',
    VIEWER: 'Просмотр',
  };
  return labels[role];
}
