/*
  Warnings:

  - You are about to drop the column `university` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "university";

-- DropEnum
DROP TYPE "RegistrationType";
