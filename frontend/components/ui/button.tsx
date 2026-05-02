import { ButtonHTMLAttributes } from 'react';
import { clsx } from 'clsx';

export function Button({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={clsx(
        'inline-flex h-9 items-center justify-center gap-2 rounded border border-blue-700 bg-accent px-3 text-sm font-medium text-white disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}
