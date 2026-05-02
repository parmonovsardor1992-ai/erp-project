/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `CashAccount` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,type]` on the table `Category` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,type]` on the table `Counterparty` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "currencyCode" "CurrencyCode" NOT NULL DEFAULT 'UZS',
ADD COLUMN     "name" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "structureAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
ADD COLUMN     "totalAmount" DECIMAL(18,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "SalaryRecord" ADD COLUMN     "departmentId" TEXT,
ADD COLUMN     "position" TEXT;

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "comment" TEXT,
ADD COLUMN     "expenseArticleId" TEXT,
ADD COLUMN     "movementTypeId" TEXT,
ADD COLUMN     "orderId" TEXT,
ADD COLUMN     "orderStructure" TEXT;

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentType" (
    "id" TEXT NOT NULL,
    "code" "TransactionType" NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovementType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "paymentType" "TransactionType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MovementType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpenseArticle" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "groupName" TEXT,
    "section" TEXT NOT NULL DEFAULT 'GENERAL',
    "defaultCurrency" "CurrencyCode",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExpenseArticle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL,
    "counterpartyId" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "departmentId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExchangeTransaction" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "fromAccountId" TEXT NOT NULL,
    "toAccountId" TEXT NOT NULL,
    "currencyFrom" "CurrencyCode" NOT NULL,
    "currencyTo" "CurrencyCode" NOT NULL,
    "amountFrom" DECIMAL(18,2) NOT NULL,
    "amountTo" DECIMAL(18,2) NOT NULL,
    "rate" DECIMAL(18,6) NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExchangeTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalaryAccrual" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "employeeId" TEXT NOT NULL,
    "counterpartyId" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "departmentId" TEXT,
    "accrualMethod" TEXT NOT NULL,
    "currencyCode" "CurrencyCode" NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "rate" DECIMAL(18,6) NOT NULL,
    "amountUzs" DECIMAL(18,2) NOT NULL,
    "amountUsd" DECIMAL(18,2) NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalaryAccrual_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpeningBalance" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "cashAccountId" TEXT NOT NULL,
    "amountUzs" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "amountUsd" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OpeningBalance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UtilityAccrual" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "counterpartyId" TEXT NOT NULL,
    "categoryId" TEXT,
    "expenseArticleId" TEXT,
    "currencyCode" "CurrencyCode" NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "rate" DECIMAL(18,6) NOT NULL,
    "amountUzs" DECIMAL(18,2) NOT NULL,
    "amountUsd" DECIMAL(18,2) NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UtilityAccrual_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_name_key" ON "Product"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Department_name_key" ON "Department"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentType_code_key" ON "PaymentType"("code");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentType_name_key" ON "PaymentType"("name");

-- CreateIndex
CREATE INDEX "MovementType_paymentType_idx" ON "MovementType"("paymentType");

-- CreateIndex
CREATE UNIQUE INDEX "MovementType_name_paymentType_key" ON "MovementType"("name", "paymentType");

-- CreateIndex
CREATE UNIQUE INDEX "ExpenseArticle_name_section_key" ON "ExpenseArticle"("name", "section");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_counterpartyId_key" ON "Employee"("counterpartyId");

-- CreateIndex
CREATE INDEX "Employee_departmentId_idx" ON "Employee"("departmentId");

-- CreateIndex
CREATE UNIQUE INDEX "Setting_key_key" ON "Setting"("key");

-- CreateIndex
CREATE INDEX "ExchangeTransaction_date_idx" ON "ExchangeTransaction"("date");

-- CreateIndex
CREATE INDEX "ExchangeTransaction_fromAccountId_idx" ON "ExchangeTransaction"("fromAccountId");

-- CreateIndex
CREATE INDEX "ExchangeTransaction_toAccountId_idx" ON "ExchangeTransaction"("toAccountId");

-- CreateIndex
CREATE INDEX "SalaryAccrual_date_idx" ON "SalaryAccrual"("date");

-- CreateIndex
CREATE INDEX "SalaryAccrual_employeeId_idx" ON "SalaryAccrual"("employeeId");

-- CreateIndex
CREATE INDEX "SalaryAccrual_counterpartyId_idx" ON "SalaryAccrual"("counterpartyId");

-- CreateIndex
CREATE INDEX "SalaryAccrual_departmentId_idx" ON "SalaryAccrual"("departmentId");

-- CreateIndex
CREATE INDEX "OpeningBalance_date_idx" ON "OpeningBalance"("date");

-- CreateIndex
CREATE INDEX "OpeningBalance_cashAccountId_idx" ON "OpeningBalance"("cashAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "OpeningBalance_date_cashAccountId_key" ON "OpeningBalance"("date", "cashAccountId");

-- CreateIndex
CREATE INDEX "UtilityAccrual_date_idx" ON "UtilityAccrual"("date");

-- CreateIndex
CREATE INDEX "UtilityAccrual_counterpartyId_idx" ON "UtilityAccrual"("counterpartyId");

-- CreateIndex
CREATE INDEX "UtilityAccrual_categoryId_idx" ON "UtilityAccrual"("categoryId");

-- CreateIndex
CREATE INDEX "UtilityAccrual_expenseArticleId_idx" ON "UtilityAccrual"("expenseArticleId");

-- CreateIndex
CREATE UNIQUE INDEX "CashAccount_name_key" ON "CashAccount"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_type_key" ON "Category"("name", "type");

-- CreateIndex
CREATE UNIQUE INDEX "Counterparty_name_type_key" ON "Counterparty"("name", "type");

-- CreateIndex
CREATE INDEX "SalaryRecord_departmentId_idx" ON "SalaryRecord"("departmentId");

-- CreateIndex
CREATE INDEX "Transaction_orderId_idx" ON "Transaction"("orderId");

-- CreateIndex
CREATE INDEX "Transaction_movementTypeId_idx" ON "Transaction"("movementTypeId");

-- CreateIndex
CREATE INDEX "Transaction_expenseArticleId_idx" ON "Transaction"("expenseArticleId");

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_counterpartyId_fkey" FOREIGN KEY ("counterpartyId") REFERENCES "Counterparty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_movementTypeId_fkey" FOREIGN KEY ("movementTypeId") REFERENCES "MovementType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_expenseArticleId_fkey" FOREIGN KEY ("expenseArticleId") REFERENCES "ExpenseArticle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExchangeTransaction" ADD CONSTRAINT "ExchangeTransaction_fromAccountId_fkey" FOREIGN KEY ("fromAccountId") REFERENCES "CashAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExchangeTransaction" ADD CONSTRAINT "ExchangeTransaction_toAccountId_fkey" FOREIGN KEY ("toAccountId") REFERENCES "CashAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryAccrual" ADD CONSTRAINT "SalaryAccrual_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryAccrual" ADD CONSTRAINT "SalaryAccrual_counterpartyId_fkey" FOREIGN KEY ("counterpartyId") REFERENCES "Counterparty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryAccrual" ADD CONSTRAINT "SalaryAccrual_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpeningBalance" ADD CONSTRAINT "OpeningBalance_cashAccountId_fkey" FOREIGN KEY ("cashAccountId") REFERENCES "CashAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryRecord" ADD CONSTRAINT "SalaryRecord_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UtilityAccrual" ADD CONSTRAINT "UtilityAccrual_counterpartyId_fkey" FOREIGN KEY ("counterpartyId") REFERENCES "Counterparty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UtilityAccrual" ADD CONSTRAINT "UtilityAccrual_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UtilityAccrual" ADD CONSTRAINT "UtilityAccrual_expenseArticleId_fkey" FOREIGN KEY ("expenseArticleId") REFERENCES "ExpenseArticle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
