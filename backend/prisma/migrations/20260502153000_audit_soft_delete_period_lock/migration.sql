-- Add audit and soft-delete fields that already exist in schema.prisma.
-- This migration keeps existing data and makes migrate reset + seed consistent.

ALTER TABLE "Counterparty"
  ADD COLUMN IF NOT EXISTS "createdBy" TEXT,
  ADD COLUMN IF NOT EXISTS "updatedBy" TEXT,
  ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

ALTER TABLE "Order"
  ADD COLUMN IF NOT EXISTS "createdBy" TEXT,
  ADD COLUMN IF NOT EXISTS "updatedBy" TEXT,
  ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

ALTER TABLE "Currency"
  ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "createdBy" TEXT,
  ADD COLUMN IF NOT EXISTS "updatedBy" TEXT,
  ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);
ALTER TABLE "Currency" ALTER COLUMN "updatedAt" DROP DEFAULT;

ALTER TABLE "CurrencyRate"
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "createdBy" TEXT,
  ADD COLUMN IF NOT EXISTS "updatedBy" TEXT,
  ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);
ALTER TABLE "CurrencyRate" ALTER COLUMN "updatedAt" DROP DEFAULT;

ALTER TABLE "CashAccount"
  ADD COLUMN IF NOT EXISTS "createdBy" TEXT,
  ADD COLUMN IF NOT EXISTS "updatedBy" TEXT,
  ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

ALTER TABLE "Category"
  ADD COLUMN IF NOT EXISTS "createdBy" TEXT,
  ADD COLUMN IF NOT EXISTS "updatedBy" TEXT,
  ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

ALTER TABLE "Product"
  ADD COLUMN IF NOT EXISTS "createdBy" TEXT,
  ADD COLUMN IF NOT EXISTS "updatedBy" TEXT,
  ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

ALTER TABLE "Department"
  ADD COLUMN IF NOT EXISTS "createdBy" TEXT,
  ADD COLUMN IF NOT EXISTS "updatedBy" TEXT,
  ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

ALTER TABLE "PaymentType"
  ADD COLUMN IF NOT EXISTS "createdBy" TEXT,
  ADD COLUMN IF NOT EXISTS "updatedBy" TEXT,
  ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

ALTER TABLE "MovementType"
  ADD COLUMN IF NOT EXISTS "createdBy" TEXT,
  ADD COLUMN IF NOT EXISTS "updatedBy" TEXT,
  ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

ALTER TABLE "ExpenseArticle"
  ADD COLUMN IF NOT EXISTS "createdBy" TEXT,
  ADD COLUMN IF NOT EXISTS "updatedBy" TEXT,
  ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

ALTER TABLE "Employee"
  ADD COLUMN IF NOT EXISTS "createdBy" TEXT,
  ADD COLUMN IF NOT EXISTS "updatedBy" TEXT,
  ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

ALTER TABLE "Setting"
  ADD COLUMN IF NOT EXISTS "createdBy" TEXT,
  ADD COLUMN IF NOT EXISTS "updatedBy" TEXT,
  ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

ALTER TABLE "Transaction"
  ADD COLUMN IF NOT EXISTS "createdBy" TEXT,
  ADD COLUMN IF NOT EXISTS "updatedBy" TEXT,
  ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

ALTER TABLE "ExchangeTransaction"
  ADD COLUMN IF NOT EXISTS "createdBy" TEXT,
  ADD COLUMN IF NOT EXISTS "updatedBy" TEXT,
  ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

ALTER TABLE "SalaryAccrual"
  ADD COLUMN IF NOT EXISTS "createdBy" TEXT,
  ADD COLUMN IF NOT EXISTS "updatedBy" TEXT,
  ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

ALTER TABLE "OpeningBalance"
  ADD COLUMN IF NOT EXISTS "createdBy" TEXT,
  ADD COLUMN IF NOT EXISTS "updatedBy" TEXT,
  ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

ALTER TABLE "SalaryRecord"
  ADD COLUMN IF NOT EXISTS "createdBy" TEXT,
  ADD COLUMN IF NOT EXISTS "updatedBy" TEXT,
  ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

ALTER TABLE "ExpenseAccrual"
  ADD COLUMN IF NOT EXISTS "createdBy" TEXT,
  ADD COLUMN IF NOT EXISTS "updatedBy" TEXT,
  ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

ALTER TABLE "UtilityAccrual"
  ADD COLUMN IF NOT EXISTS "createdBy" TEXT,
  ADD COLUMN IF NOT EXISTS "updatedBy" TEXT,
  ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

CREATE TABLE IF NOT EXISTS "PeriodLock" (
  "id" TEXT NOT NULL,
  "dateFrom" TIMESTAMP(3) NOT NULL,
  "dateTo" TIMESTAMP(3) NOT NULL,
  "isLocked" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "createdBy" TEXT,
  "updatedBy" TEXT,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "PeriodLock_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Counterparty_deletedAt_idx" ON "Counterparty"("deletedAt");
CREATE INDEX IF NOT EXISTS "Order_deletedAt_idx" ON "Order"("deletedAt");
CREATE INDEX IF NOT EXISTS "Currency_deletedAt_idx" ON "Currency"("deletedAt");
CREATE INDEX IF NOT EXISTS "CurrencyRate_deletedAt_idx" ON "CurrencyRate"("deletedAt");
CREATE INDEX IF NOT EXISTS "CashAccount_deletedAt_idx" ON "CashAccount"("deletedAt");
CREATE INDEX IF NOT EXISTS "Category_deletedAt_idx" ON "Category"("deletedAt");
CREATE INDEX IF NOT EXISTS "Product_deletedAt_idx" ON "Product"("deletedAt");
CREATE INDEX IF NOT EXISTS "Department_deletedAt_idx" ON "Department"("deletedAt");
CREATE INDEX IF NOT EXISTS "PaymentType_deletedAt_idx" ON "PaymentType"("deletedAt");
CREATE INDEX IF NOT EXISTS "MovementType_deletedAt_idx" ON "MovementType"("deletedAt");
CREATE INDEX IF NOT EXISTS "ExpenseArticle_deletedAt_idx" ON "ExpenseArticle"("deletedAt");
CREATE INDEX IF NOT EXISTS "Employee_deletedAt_idx" ON "Employee"("deletedAt");
CREATE INDEX IF NOT EXISTS "Setting_deletedAt_idx" ON "Setting"("deletedAt");
CREATE INDEX IF NOT EXISTS "Transaction_deletedAt_idx" ON "Transaction"("deletedAt");
CREATE INDEX IF NOT EXISTS "ExchangeTransaction_deletedAt_idx" ON "ExchangeTransaction"("deletedAt");
CREATE INDEX IF NOT EXISTS "SalaryAccrual_deletedAt_idx" ON "SalaryAccrual"("deletedAt");
CREATE INDEX IF NOT EXISTS "OpeningBalance_deletedAt_idx" ON "OpeningBalance"("deletedAt");
CREATE INDEX IF NOT EXISTS "SalaryRecord_deletedAt_idx" ON "SalaryRecord"("deletedAt");
CREATE INDEX IF NOT EXISTS "ExpenseAccrual_deletedAt_idx" ON "ExpenseAccrual"("deletedAt");
CREATE INDEX IF NOT EXISTS "UtilityAccrual_deletedAt_idx" ON "UtilityAccrual"("deletedAt");
CREATE INDEX IF NOT EXISTS "PeriodLock_dateFrom_idx" ON "PeriodLock"("dateFrom");
CREATE INDEX IF NOT EXISTS "PeriodLock_dateTo_idx" ON "PeriodLock"("dateTo");
CREATE INDEX IF NOT EXISTS "PeriodLock_isLocked_idx" ON "PeriodLock"("isLocked");
CREATE INDEX IF NOT EXISTS "PeriodLock_deletedAt_idx" ON "PeriodLock"("deletedAt");
