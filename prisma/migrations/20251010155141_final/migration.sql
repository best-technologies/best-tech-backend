-- CreateEnum
CREATE TYPE "public"."WalletKind" AS ENUM ('provider_synced', 'user');

-- CreateEnum
CREATE TYPE "public"."TransactionType" AS ENUM ('credit', 'debit');

-- CreateEnum
CREATE TYPE "public"."SmsStatus" AS ENUM ('pending', 'sent', 'failed');

-- CreateEnum
CREATE TYPE "public"."EmailStatus" AS ENUM ('pending', 'sent', 'failed', 'bounced', 'delivered', 'opened', 'clicked');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."ContactSubject" ADD VALUE 'sales_and_partnership';
ALTER TYPE "public"."ContactSubject" ADD VALUE 'technical_support';
ALTER TYPE "public"."ContactSubject" ADD VALUE 'careers_and_hr';
ALTER TYPE "public"."ContactSubject" ADD VALUE 'media_and_press';

-- CreateTable
CREATE TABLE "public"."sms_wallets" (
    "id" TEXT NOT NULL,
    "kind" "public"."WalletKind" NOT NULL DEFAULT 'provider_synced',
    "provider" TEXT DEFAULT 'bulksmsnigeria',
    "userId" TEXT,
    "totalBalance" DOUBLE PRECISION,
    "universalWallet" DOUBLE PRECISION,
    "smsWallet" DOUBLE PRECISION,
    "smsBonus" DOUBLE PRECISION,
    "mainBalance" DOUBLE PRECISION,
    "volumeBonus" DOUBLE PRECISION,
    "promoBonus" DOUBLE PRECISION,
    "currentBalance" DOUBLE PRECISION DEFAULT 0,
    "balanceBefore" DOUBLE PRECISION,
    "balanceAfter" DOUBLE PRECISION,
    "lastAmountSpent" DOUBLE PRECISION DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sms_wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sms" (
    "id" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT[],
    "body" TEXT NOT NULL,
    "gateway" TEXT,
    "platform" TEXT NOT NULL DEFAULT 'bulksmsnigeria',
    "appendSender" TEXT,
    "callbackUrl" TEXT,
    "customerReference" TEXT,
    "status" "public"."SmsStatus" NOT NULL DEFAULT 'pending',
    "providerMessageId" TEXT,
    "cost" DOUBLE PRECISION,
    "currency" TEXT,
    "responseRaw" JSONB,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sms_wallet_transactions" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "type" "public"."TransactionType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "reference" TEXT,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sms_wallet_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sms_cost_tiers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "minUnits" INTEGER NOT NULL,
    "maxUnits" INTEGER,
    "pricePerSms" DOUBLE PRECISION NOT NULL,
    "gateway" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sms_cost_tiers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."email_wallets" (
    "id" TEXT NOT NULL,
    "kind" "public"."WalletKind" NOT NULL DEFAULT 'provider_synced',
    "provider" TEXT DEFAULT 'gmail_smtp',
    "userId" TEXT,
    "totalBalance" DOUBLE PRECISION,
    "emailWallet" DOUBLE PRECISION,
    "emailBonus" DOUBLE PRECISION,
    "mainBalance" DOUBLE PRECISION,
    "volumeBonus" DOUBLE PRECISION,
    "promoBonus" DOUBLE PRECISION,
    "currentBalance" DOUBLE PRECISION DEFAULT 0,
    "balanceBefore" DOUBLE PRECISION,
    "balanceAfter" DOUBLE PRECISION,
    "lastAmountSpent" DOUBLE PRECISION DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."emails" (
    "id" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "fromName" TEXT,
    "to" TEXT[],
    "cc" TEXT[],
    "bcc" TEXT[],
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "contentType" TEXT NOT NULL DEFAULT 'text/html',
    "attachments" JSONB,
    "replyTo" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "platform" TEXT NOT NULL DEFAULT 'gmail_smtp',
    "callbackUrl" TEXT,
    "customerReference" TEXT,
    "status" "public"."EmailStatus" NOT NULL DEFAULT 'pending',
    "providerMessageId" TEXT,
    "cost" DOUBLE PRECISION,
    "currency" TEXT,
    "responseRaw" JSONB,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "emails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."email_wallet_transactions" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "type" "public"."TransactionType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "reference" TEXT,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_wallet_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."email_cost_tiers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "minEmails" INTEGER NOT NULL,
    "maxEmails" INTEGER,
    "pricePerEmail" DOUBLE PRECISION NOT NULL,
    "provider" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_cost_tiers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sms_customerReference_key" ON "public"."sms"("customerReference");

-- CreateIndex
CREATE UNIQUE INDEX "sms_cost_tiers_minUnits_maxUnits_gateway_key" ON "public"."sms_cost_tiers"("minUnits", "maxUnits", "gateway");

-- CreateIndex
CREATE UNIQUE INDEX "emails_customerReference_key" ON "public"."emails"("customerReference");

-- CreateIndex
CREATE UNIQUE INDEX "email_cost_tiers_minEmails_maxEmails_provider_key" ON "public"."email_cost_tiers"("minEmails", "maxEmails", "provider");

-- AddForeignKey
ALTER TABLE "public"."sms_wallets" ADD CONSTRAINT "sms_wallets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sms" ADD CONSTRAINT "sms_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sms_wallet_transactions" ADD CONSTRAINT "sms_wallet_transactions_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "public"."sms_wallets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."email_wallets" ADD CONSTRAINT "email_wallets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."emails" ADD CONSTRAINT "emails_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."email_wallet_transactions" ADD CONSTRAINT "email_wallet_transactions_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "public"."email_wallets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
