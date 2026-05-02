# ERP Accounting System

Full-stack ERP scaffold for replacing an Excel-based accounting workflow.

## Structure

```text
backend/
  prisma/schema.prisma
  src/common/prisma
  src/modules/transactions
  src/modules/orders
  src/modules/balances
  src/modules/rates
  src/modules/counterparties
  src/modules/salary
frontend/
  app/dashboard
  app/finance
  app/orders
  app/salary
  app/counterparties
  components
  features
  lib
  store
```

## Excel Logic Converted

- Currency rate is resolved by transaction date from `currency_rates`.
- `totalUzs = amountUzs + amountUsd * rate`.
- `totalUsd = amountUsd + amountUzs / rate`.
- Income stores positive signed totals, expense stores negative signed totals.
- Exchange is stored as a special transaction type with neutral report totals.
- Balances are calculated with grouped sums by cash account.
- Orders are returned with `structure != null` and sorted by `startDate`.
- Salary balance is calculated in backend as `startBalance + accrued - paid`.
- Counterparty debt is calculated as `accruedUzs - paidUzs`.

## Run Locally

```bash
docker compose up -d
cd backend
cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

```bash
cd frontend
npm install
echo NEXT_PUBLIC_API_URL=http://localhost:4000/api > .env.local
npm run dev
```

Open `http://localhost:3000`.

## Sample API Calls

```bash
curl http://localhost:4000/api/balances
curl http://localhost:4000/api/orders
curl http://localhost:4000/api/transactions?page=1\&limit=50
```

```bash
curl -X POST http://localhost:4000/api/rates \
  -H "Content-Type: application/json" \
  -d '{"code":"USD","date":"2026-05-01","rateToUzs":12600}'
```

```bash
curl -X POST http://localhost:4000/api/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "date":"2026-05-01",
    "type":"INCOME",
    "cashAccountId":"ACCOUNT_ID",
    "categoryId":"CATEGORY_ID",
    "counterpartyId":"COUNTERPARTY_ID",
    "description":"Order payment",
    "amountUzs":1000000,
    "amountUsd":100
  }'
```
