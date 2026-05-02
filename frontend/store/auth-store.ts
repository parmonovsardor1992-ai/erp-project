'use client';

import { create } from 'zustand';
import { AuthUser } from '@/lib/types';

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  initialized: boolean;
  hydrate: () => void;
  login: (accessToken: string, refreshToken: string, user: AuthUser) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  initialized: false,
  hydrate: () => {
    if (typeof window === 'undefined') return;
    const accessToken = window.localStorage.getItem('erp-access-token');
    const refreshToken = window.localStorage.getItem('erp-refresh-token');
    const userRaw = window.localStorage.getItem('erp-user');
    const user = userRaw ? (JSON.parse(userRaw) as AuthUser) : null;
    set({ accessToken, refreshToken, user, initialized: true });
  },
  login: (accessToken, refreshToken, user) => {
    window.localStorage.setItem('erp-access-token', accessToken);
    window.localStorage.setItem('erp-refresh-token', refreshToken);
    window.localStorage.setItem('erp-user', JSON.stringify(user));
    set({ accessToken, refreshToken, user, initialized: true });
  },
  logout: () => {
    window.localStorage.removeItem('erp-access-token');
    window.localStorage.removeItem('erp-refresh-token');
    window.localStorage.removeItem('erp-user');
    set({ accessToken: null, refreshToken: null, user: null, initialized: true });
  },
}));
