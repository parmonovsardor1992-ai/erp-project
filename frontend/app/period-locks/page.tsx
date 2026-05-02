'use client';

import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/field';
import { PageTitle } from '@/components/ui/page-title';
import { useCreatePeriodLock, useDeletePeriodLock, usePeriodLocks, useUpdatePeriodLock } from '@/lib/hooks';
import { useAuthStore } from '@/store/auth-store';

export default function PeriodLocksPage() {
  const user = useAuthStore((state) => state.user);
  const locks = usePeriodLocks();
  const create = useCreatePeriodLock();
  const update = useUpdatePeriodLock();
  const remove = useDeletePeriodLock();
  const [dateFrom, setDateFrom] = useState(new Date().toISOString().slice(0, 10));
  const [dateTo, setDateTo] = useState(new Date().toISOString().slice(0, 10));
  const canEdit = user?.role === 'ADMIN';

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    create.mutate({ dateFrom, dateTo, isLocked: true });
  }

  return (
    <>
      <PageTitle title="Закрытие периода" />
      <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
        <section className="rounded border border-line bg-white">
          <div className="border-b border-line bg-panel px-3 py-2 text-sm font-semibold">Периоды</div>
          <table className="erp-table">
            <thead>
              <tr>
                <th>Дата от</th>
                <th>Дата до</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {locks.isLoading && (
                <tr>
                  <td colSpan={4}>Загрузка...</td>
                </tr>
              )}
              {(locks.data ?? []).map((lock) => (
                <tr key={lock.id}>
                  <td>{new Date(lock.dateFrom).toLocaleDateString('ru-RU')}</td>
                  <td>{new Date(lock.dateTo).toLocaleDateString('ru-RU')}</td>
                  <td>{lock.isLocked ? 'Закрыт' : 'Открыт'}</td>
                  <td>
                    {canEdit ? (
                      <div className="flex gap-2">
                        <button
                          className="text-[var(--accent-text)]"
                          type="button"
                          onClick={() => update.mutate({ id: lock.id, body: { isLocked: !lock.isLocked } })}
                        >
                          {lock.isLocked ? 'Открыть' : 'Закрыть'}
                        </button>
                        <button
                          className="text-danger"
                          type="button"
                          onClick={() => window.confirm('Удалить период?') && remove.mutate(lock.id)}
                        >
                          Удалить
                        </button>
                      </div>
                    ) : (
                      'Только просмотр'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <form onSubmit={submit} className="rounded border border-line bg-white">
          <div className="border-b border-line bg-panel px-3 py-2 text-sm font-semibold">Новый период</div>
          <div className="grid gap-3 p-3">
            {!canEdit && <div className="rounded border border-line bg-panel p-3 text-sm">Нет доступа на изменение.</div>}
            <TextField type="date" value={dateFrom} disabled={!canEdit} onChange={(event) => setDateFrom(event.target.value)} />
            <TextField type="date" value={dateTo} disabled={!canEdit} onChange={(event) => setDateTo(event.target.value)} />
            <Button type="submit" disabled={!canEdit}>
              Закрыть период
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
