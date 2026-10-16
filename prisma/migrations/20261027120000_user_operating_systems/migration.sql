-- AlterTable
ALTER TABLE "User" ADD COLUMN "operatingSystems" TEXT[] DEFAULT ARRAY[]::TEXT[];
