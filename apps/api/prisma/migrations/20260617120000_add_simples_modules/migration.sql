-- CreateEnum
CREATE TYPE "NoteDirection" AS ENUM ('RECEBIDA', 'EMITIDA');

-- CreateEnum
CREATE TYPE "TaxObligationType" AS ENUM ('DAS', 'DEFIS', 'OUTRO');

-- CreateEnum
CREATE TYPE "ObligationStatus" AS ENUM ('PENDENTE', 'PAGO', 'ATRASADO');

-- CreateEnum
CREATE TYPE "EmployeeStatus" AS ENUM ('ATIVO', 'FERIAS', 'AFASTADO', 'DESLIGADO');

-- CreateEnum
CREATE TYPE "PayrollStatus" AS ENUM ('ABERTA', 'FECHADA', 'PAGA');

-- CreateEnum
CREATE TYPE "EsocialStatus" AS ENUM ('PENDENTE', 'ENVIADO');

-- CreateEnum
CREATE TYPE "CorporateDocType" AS ENUM ('CONTRATO_SOCIAL', 'CERTIFICADO_DIGITAL', 'PROCURACAO', 'ALVARA', 'OUTRO');

-- CreateEnum
CREATE TYPE "ExportFormat" AS ENUM ('XML', 'CSV', 'ZIP');

-- CreateEnum
CREATE TYPE "ExportStatus" AS ENUM ('PENDENTE', 'GERADO', 'ENVIADO');

-- CreateEnum
CREATE TYPE "StockMoveType" AS ENUM ('IN', 'OUT', 'ADJUST');

-- AlterTable
ALTER TABLE "Product"
    ADD COLUMN "cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    ADD COLUMN "stockQty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    ADD COLUMN "minStock" DOUBLE PRECISION NOT NULL DEFAULT 0,
    ADD COLUMN "supplierId" TEXT;

-- AlterTable
ALTER TABLE "FiscalNote"
    ADD COLUMN "direction" "NoteDirection" NOT NULL DEFAULT 'RECEBIDA',
    ADD COLUMN "customerName" TEXT,
    ADD COLUMN "posted" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Supplier" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cnpj" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "category" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "document" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "faceDescriptor" TEXT,
    "webauthnCredId" TEXT,
    "qrToken" TEXT,
    "creditLimit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockMovement" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "type" "StockMoveType" NOT NULL,
    "qty" DOUBLE PRECISION NOT NULL,
    "reason" TEXT,
    "refType" TEXT,
    "refId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockMovement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxObligation" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "type" "TaxObligationType" NOT NULL DEFAULT 'DAS',
    "competence" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "baseRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "ObligationStatus" NOT NULL DEFAULT 'PENDENTE',
    "paidDate" TIMESTAMP(3),
    "receiptPath" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaxObligation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cpf" TEXT,
    "role" TEXT,
    "admissionDate" TIMESTAMP(3),
    "salary" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "EmployeeStatus" NOT NULL DEFAULT 'ATIVO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayrollEntry" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "competence" TEXT NOT NULL,
    "baseSalary" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fgts" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "inss" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "netPay" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "vacationDue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "esocialStatus" "EsocialStatus" NOT NULL DEFAULT 'PENDENTE',
    "status" "PayrollStatus" NOT NULL DEFAULT 'ABERTA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PayrollEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CorporateDoc" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "type" "CorporateDocType" NOT NULL DEFAULT 'OUTRO',
    "title" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3),
    "storagePath" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CorporateDoc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountingExport" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "competence" TEXT NOT NULL,
    "format" "ExportFormat" NOT NULL DEFAULT 'ZIP',
    "status" "ExportStatus" NOT NULL DEFAULT 'PENDENTE',
    "notesCount" INTEGER NOT NULL DEFAULT 0,
    "entriesCount" INTEGER NOT NULL DEFAULT 0,
    "payrollCount" INTEGER NOT NULL DEFAULT 0,
    "storagePath" TEXT,
    "generatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccountingExport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Supplier_companyId_idx" ON "Supplier"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_qrToken_key" ON "Customer"("qrToken");

-- CreateIndex
CREATE INDEX "Customer_companyId_idx" ON "Customer"("companyId");

-- CreateIndex
CREATE INDEX "StockMovement_companyId_idx" ON "StockMovement"("companyId");

-- CreateIndex
CREATE INDEX "StockMovement_productId_idx" ON "StockMovement"("productId");

-- CreateIndex
CREATE INDEX "TaxObligation_companyId_idx" ON "TaxObligation"("companyId");

-- CreateIndex
CREATE INDEX "Employee_companyId_idx" ON "Employee"("companyId");

-- CreateIndex
CREATE INDEX "PayrollEntry_companyId_idx" ON "PayrollEntry"("companyId");

-- CreateIndex
CREATE INDEX "PayrollEntry_employeeId_idx" ON "PayrollEntry"("employeeId");

-- CreateIndex
CREATE INDEX "CorporateDoc_companyId_idx" ON "CorporateDoc"("companyId");

-- CreateIndex
CREATE INDEX "AccountingExport_companyId_idx" ON "AccountingExport"("companyId");

-- AddForeignKey
ALTER TABLE "PayrollEntry" ADD CONSTRAINT "PayrollEntry_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
