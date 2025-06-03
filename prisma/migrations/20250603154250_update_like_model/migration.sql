/*
  Warnings:

  - A unique constraint covering the columns `[userId,setupId]` on the table `Like` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Like" ADD COLUMN     "setupId" TEXT,
ALTER COLUMN "adviseId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Like_userId_setupId_key" ON "Like"("userId", "setupId");

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_setupId_fkey" FOREIGN KEY ("setupId") REFERENCES "Setup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
