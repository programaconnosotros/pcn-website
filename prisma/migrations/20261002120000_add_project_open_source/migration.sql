-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "isOpenSource" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "repoUrl" TEXT;
