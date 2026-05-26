ALTER TABLE "Transaction"
ADD COLUMN "paymentMethod" TEXT,
ADD COLUMN "account" TEXT,
ADD COLUMN "isSettled" BOOLEAN NOT NULL DEFAULT true;
