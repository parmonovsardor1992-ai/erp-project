'use client';

import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { SelectField, TextField } from '@/components/ui/field';
import { PageTitle } from '@/components/ui/page-title';
import {
  useActivateUser,
  useCreateUser,
  useDeactivateUser,
  useDeleteUser,
  useUpdateUser,
  useUpdateUserPassword,
  useUsers,
} from '@/lib/hooks';
import { UserListItem, UserRole } from '@/lib/types';

const roles: Array<{ value: UserRole; label: string }> = [
  { value: 'ADMIN', label: 'Администратор' },
  { value: 'ACCOUNTANT', label: 'Бухгалтер' },
  { value: 'MANAGER', label: 'Менеджер' },
  { value: 'VIEWER', label: 'Просмотр' },
];

const emptyForm = { username: '', fullName: '', password: '', role: 'VIEWER' as UserRole };

export default function UsersPage() {
  const users = useUsers();
  const create = useCreateUser();
  const update = useUpdateUser();
  const remove = useDeleteUser();
  const activate = useActivateUser();
  const deactivate = useDeactivateUser();
  const updatePassword = useUpdateUserPassword();
  const [editing, setEditing] = useState<UserListItem | null>(null);
  const [form, setForm] = useState(emptyForm);

  function edit(user: UserListItem) {
    setEditing(user);
    setForm({ username: user.username, fullName: user.fullName, password: '', role: user.role });
  }

  function reset() {
    setEditing(null);
    setForm(emptyForm);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (editing) {
      update.mutate({ id: editing.id, body: { username: form.username, fullName: form.fullName, role: form.role } }, { onSuccess: reset });
      if (form.password) updatePassword.mutate({ id: editing.id, password: form.password });
      return;
    }
    create.mutate(form, { onSuccess: reset });
  }

  return (
    <>
      <PageTitle title="Пользователи" />
      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <section className="rounded border border-line bg-white">
          <div className="border-b border-line bg-panel px-3 py-2 text-sm font-semibold">Список пользователей</div>
          <div className="max-h-[72vh] overflow-auto">
            <table className="erp-table">
              <thead className="sticky top-0 z-[1]">
                <tr>
                  <th>Логин</th>
                  <th>ФИО</th>
                  <th>Роль</th>
                  <th>Статус</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {users.isLoading && (
                  <tr>
                    <td colSpan={5}>Загрузка...</td>
                  </tr>
                )}
                {(users.data ?? []).map((user) => (
                  <tr key={user.id}>
                    <td>{user.username}</td>
                    <td>{user.fullName}</td>
                    <td>{roles.find((role) => role.value === user.role)?.label ?? user.role}</td>
                    <td>{user.isActive ? 'Активен' : 'Заблокирован'}</td>
                    <td>
                      <div className="flex flex-wrap gap-2">
                        <button className="text-[var(--accent-text)]" type="button" onClick={() => edit(user)}>
                          Редактировать
                        </button>
                        <button
                          className="text-[var(--accent-text)]"
                          type="button"
                          onClick={() => (user.isActive ? deactivate.mutate(user.id) : activate.mutate(user.id))}
                        >
                          {user.isActive ? 'Заблокировать' : 'Активировать'}
                        </button>
                        <button
                          className="text-danger"
                          type="button"
                          onClick={() => window.confirm(`Удалить пользователя ${user.username}?`) && remove.mutate(user.id)}
                        >
                          Удалить
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <form onSubmit={submit} className="rounded border border-line bg-white">
          <div className="border-b border-line bg-panel px-3 py-2 text-sm font-semibold">{editing ? 'Редактировать' : 'Добавить'}</div>
          <div className="grid gap-3 p-3">
            <TextField placeholder="Логин" value={form.username} onChange={(event) => setForm((value) => ({ ...value, username: event.target.value }))} />
            <TextField placeholder="ФИО" value={form.fullName} onChange={(event) => setForm((value) => ({ ...value, fullName: event.target.value }))} />
            <SelectField value={form.role} onChange={(event) => setForm((value) => ({ ...value, role: event.target.value as UserRole }))}>
              {roles.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </SelectField>
            <TextField
              placeholder={editing ? 'Новый пароль, если нужно' : 'Пароль'}
              type="password"
              value={form.password}
              onChange={(event) => setForm((value) => ({ ...value, password: event.target.value }))}
            />
            <Button type="submit">{editing ? 'Сохранить' : 'Добавить'}</Button>
            {editing && (
              <button className="h-9 rounded border border-line" type="button" onClick={reset}>
                Отмена
              </button>
            )}
          </div>
        </form>
      </div>
    </>
  );
}
