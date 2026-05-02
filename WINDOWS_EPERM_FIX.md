# Windows EPERM fix

Если Windows блокирует `npm`, `next build` или `prisma migrate` с ошибкой `spawn EPERM`, выполните команды в PowerShell от имени администратора.

## Backend

```powershell
cd "C:\Users\Lenovo\Documents\New project 4\backend"
npm cache clean --force
Remove-Item -Recurse -Force node_modules, package-lock.json
npm install
npx prisma generate
npx prisma migrate dev
npm run build
```

## Frontend

```powershell
cd "C:\Users\Lenovo\Documents\New project 4\frontend"
npm cache clean --force
Remove-Item -Recurse -Force node_modules, package-lock.json
npm install
npm run typecheck
npm run build
```

## Если ошибка остается

- Закройте все терминалы, где запущены backend/frontend.
- Закройте VS Code и процессы Node.js в диспетчере задач.
- Проверьте, что антивирус не блокирует папку проекта.
- Лучше использовать Node.js 20 LTS, потому что проект рассчитан на Node 20.
