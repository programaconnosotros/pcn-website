-- CreateEnum
CREATE TYPE "Role" AS ENUM ('REGULAR', 'ADMIN');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'REGULAR';
