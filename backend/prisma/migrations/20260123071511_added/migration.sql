/*
  Warnings:

  - You are about to drop the column `audio_link` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `styled_summary` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `summary` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "audio_link",
DROP COLUMN "styled_summary",
DROP COLUMN "summary",
ADD COLUMN     "credits" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "email" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Book" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "author" TEXT,
    "cover_link" TEXT,
    "summary" TEXT,
    "styled_summary" TEXT,
    "audio_link" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Book_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Book" ADD CONSTRAINT "Book_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
