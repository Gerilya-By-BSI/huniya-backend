/*
  Warnings:

  - Changed the type of `credit_mix` on the `core_banking_users` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `payment_behaviour` on the `core_banking_users` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "core_banking_users" ALTER COLUMN "changed_credit_limit" SET DATA TYPE DOUBLE PRECISION,
DROP COLUMN "credit_mix",
ADD COLUMN     "credit_mix" INTEGER NOT NULL,
ALTER COLUMN "outstanding_debt" SET DATA TYPE DOUBLE PRECISION,
DROP COLUMN "payment_behaviour",
ADD COLUMN     "payment_behaviour" INTEGER NOT NULL;
