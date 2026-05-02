'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/field';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    try {
      const result = await api.login({ username, password });
      login(result.accessToken, result.user);
      router.replace('/dashboard');
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[var(--bg)] p-4">
      <form onSubmit={submit} className="theme-surface theme-border w-full max-w-sm rounded border p-5 shadow-sm">
        <div className="mb-5">
          <h1 className="text-lg font-semibold">Вход в ERP</h1>
          <p className="theme-muted-text mt-1 text-sm">Введите логин и пароль пользователя.</p>
        </div>
        <div className="space-y-3">
          <label className="grid gap-1 text-sm">
            <span className="theme-muted-text">Логин</span>
            <TextField value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="theme-muted-text">Пароль</span>
            <TextField
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
            />
          </label>
        </div>
        <Button className="mt-5 w-full" type="submit" disabled={loading}>
          {loading ? 'Вход...' : 'Войти'}
        </Button>
      </form>
    </main>
  );
}
