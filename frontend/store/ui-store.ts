import { create } from 'zustand';

type UiState = {
  sidebarCollapsed: boolean;
  financeType: 'ALL' | 'INCOME' | 'EXPENSE' | 'EXCHANGE';
  theme: 'light' | 'dark';
  toggleSidebar: () => void;
  setFinanceType: (type: UiState['financeType']) => void;
  setTheme: (theme: UiState['theme']) => void;
  toggleTheme: () => void;
};

export const useUiStore = create<UiState>((set) => ({
  sidebarCollapsed: false,
  financeType: 'ALL',
  theme: 'light',
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setFinanceType: (financeType) => set({ financeType }),
  setTheme: (theme) => set({ theme }),
  toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
}));
