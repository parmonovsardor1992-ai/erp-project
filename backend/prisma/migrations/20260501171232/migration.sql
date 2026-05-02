-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'ACCOUNTANT', 'MANAGER', 'VIEWER');

-- CreateEnum
CREATE TYPE "CounterpartyType" AS ENUM ('CUSTOMER', 'SUPPLIER', 'EMPLOYEE');

-- CreateEnum
CREATE TYPE "CurrencyCode" AS ENUM ('UZS', 'USD');

-- CreateEnum
CREATE TYPE "CashAccountType" AS ENUM ('CASH', 'BANK', 'CARD');

-- CreateEnum
CREATE TYPE "CategoryType" AS ENUM ('INCOME', 'EXPENSE');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('INCOME', 'EXPENSE', 'EXCHANGE');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('NEW', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'VIEWER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Counterparty" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "CounterpartyType" NOT NULL,
    "phone" TEXT,
    "taxId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Counterparty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "counterpartyId" TEXT NOT NULL,
    "structure" TEXT,
    "status" "OrderStatus" NOT NULL DEFAULT 'NEW',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "amountUzs" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "amountUsd" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Currency" (
    "id" TEXT NOT NULL,
    "code" "CurrencyCode" NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Currency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CurrencyRate" (
    "id" TEXT NOT NULL,
    "currencyId" TEXT NOT NULL,
    "code" "CurrencyCode" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "rateToUzs" DECIMAL(18,6) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CurrencyRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CashAccount" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "CashAccountType" NOT NULL,
    "currencyCode" "CurrencyCode" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CashAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "CategoryType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "type" "TransactionType" NOT NULL,
    "cashAccountId" TEXT NOT NULL,
    "categoryId" TEXT,
    "counterpartyId" TEXT,
    "description" TEXT,
    "amountUzs" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "amountUsd" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "rate" DECIMAL(18,6) NOT NULL,
    "totalUzs" DECIMAL(18,2) NOT NULL,
    "totalUsd" DECIMAL(18,2) NOT NULL,
    "signedTotalUzs" DECIMAL(18,2) NOT NULL,
    "signedTotalUsd" DECIMAL(18,2) NOT NULL,
    "exchangeAccountId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalaryRecord" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "period" TIMESTAMP(3) NOT NULL,
    "startBalance" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "accrued" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "paid" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "finalBalance" DECIMAL(18,2) NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalaryRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpenseAccrual" (
    "id" TEXT NOT NULL,
    "counterpartyId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "accruedUzs" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "paidUzs" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExpenseAccrual_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Counterparty_type_idx" ON "Counterparty"("type");

-- CreateIndex
CREATE UNIQUE INDEX "Order_number_key" ON "Order"("number");

-- CreateIndex
CREATE INDEX "Order_startDate_idx" ON "Order"("startDate");

-- CreateIndex
CREATE INDEX "Order_structure_idx" ON "Order"("structure");

-- CreateIndex
CREATE UNIQUE INDEX "Currency_code_key" ON "Currency"("code");

-- CreateIndex
CREATE INDEX "CurrencyRate_date_idx" ON "CurrencyRate"("date");

-- CreateIndex
CREATE UNIQUE INDEX "CurrencyRate_code_date_key" ON "CurrencyRate"("code", "date");

-- CreateIndex
CREATE INDEX "CashAccount_type_idx" ON "CashAccount"("type");

-- CreateIndex
CREATE INDEX "Transaction_date_idx" ON "Transaction"("date");

-- CreateIndex
CREATE INDEX "Transaction_type_idx" ON "Transaction"("type");

-- CreateIndex
CREATE INDEX "Transaction_cashAccountId_idx" ON "Transaction"("cashAccountId");

-- CreateIndex
CREATE INDEX "Transaction_counterpartyId_idx" ON "Transaction"("counterpartyId");

-- CreateIndex
CREATE INDEX "SalaryRecord_period_idx" ON "SalaryRecord"("period");

-- CreateIndex
CREATE UNIQUE INDEX "SalaryRecord_employeeId_period_key" ON "SalaryRecord"("employeeId", "period");

-- CreateIndex
CREATE INDEX "ExpenseAccrual_date_idx" ON "ExpenseAccrual"("date");

-- CreateIndex
CREATE INDEX "ExpenseAccrual_counterpartyId_idx" ON "ExpenseAccrual"("counterpartyId");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_counterpartyId_fkey" FOREIGN KEY ("counterpartyId") REFERENCES "Counterparty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CurrencyRate" ADD CONSTRAINT "CurrencyRate_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "Currency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_cashAccountId_fkey" FOREIGN KEY ("cashAccountId") REFERENCES "CashAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_counterpartyId_fkey" FOREIGN KEY ("counterpartyId") REFERENCES "Counterparty"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryRecord" ADD CONSTRAINT "SalaryRecord_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Counterparty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpenseAccrual" ADD CONSTRAINT "ExpenseAccrual_counterpartyId_fkey" FOREIGN KEY ("counterpartyId") REFERENCES "Counterparty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
