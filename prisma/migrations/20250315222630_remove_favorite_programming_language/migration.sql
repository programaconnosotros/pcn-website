/*
  Warnings:

  - You are about to drop the column `favoriteProgrammingLanguage` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "favoriteProgrammingLanguage";

-- CreateIndex
CREATE INDEX "UserLanguage_userId_idx" ON "UserLanguage"("userId");
