/*
  Warnings:

  - You are about to drop the column `status` on the `tracking_status` table. All the data in the column will be lost.
  - Added the required column `name` to the `tracking_status` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_profile_risk_id_fkey";

-- AlterTable
ALTER TABLE "tracking_status" DROP COLUMN "status",
ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "profile_risk_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_profile_risk_id_fkey" FOREIGN KEY ("profile_risk_id") REFERENCES "profile_risks"("id") ON DELETE SET NULL ON UPDATE CASCADE;
