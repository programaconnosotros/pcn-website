/*
  Warnings:

  - You are about to drop the column `proficiency` on the `UserLanguage` table. All the data in the column will be lost.
  - Added the required column `color` to the `UserLanguage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `logo` to the `UserLanguage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserLanguage" DROP COLUMN "proficiency",
ADD COLUMN     "color" TEXT NOT NULL,
ADD COLUMN     "logo" TEXT NOT NULL;
