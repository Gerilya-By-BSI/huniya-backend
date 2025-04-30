/*
  Warnings:

  - You are about to drop the column `created_at` on the `branches` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `branches` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `branches` table. All the data in the column will be lost.
  - You are about to drop the column `amount_invested_monthly` on the `core_banking_users` table. All the data in the column will be lost.
  - You are about to drop the column `credit_utilization_ratio` on the `core_banking_users` table. All the data in the column will be lost.
  - You are about to drop the column `detail_url` on the `houses` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `documents` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "branches" DROP COLUMN "created_at",
DROP COLUMN "location",
DROP COLUMN "updated_at";

-- AlterTable
ALTER TABLE "core_banking_users" DROP COLUMN "amount_invested_monthly",
DROP COLUMN "credit_utilization_ratio";

-- AlterTable
ALTER TABLE "houses" DROP COLUMN "detail_url";

-- CreateIndex
CREATE UNIQUE INDEX "documents_userId_key" ON "documents"("userId");
