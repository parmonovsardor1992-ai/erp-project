import { InputHTMLAttributes, SelectHTMLAttributes } from 'react';

export function TextField(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className="h-9 rounded border border-line bg-white px-2 text-sm outline-none focus:border-accent" {...props} />;
}

export function SelectField(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className="h-9 rounded border border-line bg-white px-2 text-sm outline-none focus:border-accent" {...props} />;
}
