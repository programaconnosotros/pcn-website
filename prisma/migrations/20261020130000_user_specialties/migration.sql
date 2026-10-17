-- AlterTable
ALTER TABLE "User" ADD COLUMN "specialties" TEXT[] DEFAULT ARRAY[]::TEXT[];
