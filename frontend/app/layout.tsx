import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'ERP Бухгалтерия',
  description: 'ERP-система для учета вместо Excel',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
