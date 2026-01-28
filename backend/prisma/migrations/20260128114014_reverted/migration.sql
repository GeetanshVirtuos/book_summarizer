/*
  Warnings:

  - You are about to drop the `UserIp` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserIp" DROP CONSTRAINT "UserIp_ipId_fkey";

-- DropForeignKey
ALTER TABLE "UserIp" DROP CONSTRAINT "UserIp_userId_fkey";

-- AlterTable
ALTER TABLE "ipAddress" ADD COLUMN     "lastUsed" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "UserIp";
