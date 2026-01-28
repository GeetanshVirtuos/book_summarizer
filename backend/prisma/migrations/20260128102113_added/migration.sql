/*
  Warnings:

  - You are about to drop the `_UserToipAddress` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Book" DROP CONSTRAINT "Book_userId_fkey";

-- DropForeignKey
ALTER TABLE "_UserToipAddress" DROP CONSTRAINT "_UserToipAddress_A_fkey";

-- DropForeignKey
ALTER TABLE "_UserToipAddress" DROP CONSTRAINT "_UserToipAddress_B_fkey";

-- DropTable
DROP TABLE "_UserToipAddress";

-- CreateTable
CREATE TABLE "UserIp" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ipId" TEXT NOT NULL,
    "dateIpUsed" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserIp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserIp_userId_idx" ON "UserIp"("userId");

-- CreateIndex
CREATE INDEX "UserIp_ipId_idx" ON "UserIp"("ipId");

-- CreateIndex
CREATE UNIQUE INDEX "UserIp_userId_ipId_key" ON "UserIp"("userId", "ipId");

-- AddForeignKey
ALTER TABLE "Book" ADD CONSTRAINT "Book_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserIp" ADD CONSTRAINT "UserIp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserIp" ADD CONSTRAINT "UserIp_ipId_fkey" FOREIGN KEY ("ipId") REFERENCES "ipAddress"("id") ON DELETE CASCADE ON UPDATE CASCADE;
