import { ReactNode } from 'react';

export function PageTitle({ title, actions }: { title: string; actions?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h1 className="text-xl font-semibold text-ink">{title}</h1>
      {actions}
    </div>
  );
}
