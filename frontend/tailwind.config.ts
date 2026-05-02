import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './features/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        line: '#d8dee8',
        panel: '#f7f9fc',
        ink: '#182230',
        muted: '#64748b',
        accent: '#2563eb',
        success: '#0f766e',
        danger: '#b91c1c',
      },
      boxShadow: {
        table: '0 1px 0 rgba(15, 23, 42, 0.04)',
      },
    },
  },
  plugins: [],
};

export default config;
