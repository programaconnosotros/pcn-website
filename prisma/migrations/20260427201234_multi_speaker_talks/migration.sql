/*
  Warnings:

  - You are about to drop the column `career` on the `Talk` table. All the data in the column will be lost.
  - You are about to drop the column `enterprise` on the `Talk` table. All the data in the column will be lost.
  - You are about to drop the column `isProfessional` on the `Talk` table. All the data in the column will be lost.
  - You are about to drop the column `isStudent` on the `Talk` table. All the data in the column will be lost.
  - You are about to drop the column `jobTitle` on the `Talk` table. All the data in the column will be lost.
  - You are about to drop the column `speakerId` on the `Talk` table. All the data in the column will be lost.
  - You are about to drop the column `speakerName` on the `Talk` table. All the data in the column will be lost.
  - You are about to drop the column `speakerPhone` on the `Talk` table. All the data in the column will be lost.
  - You are about to drop the column `studyPlace` on the `Talk` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Talk" DROP CONSTRAINT "Talk_speakerId_fkey";

-- DropIndex
DROP INDEX "Talk_speakerId_idx";

-- AlterTable
ALTER TABLE "Talk" DROP COLUMN "career",
DROP COLUMN "enterprise",
DROP COLUMN "isProfessional",
DROP COLUMN "isStudent",
DROP COLUMN "jobTitle",
DROP COLUMN "speakerId",
DROP COLUMN "speakerName",
DROP COLUMN "speakerPhone",
DROP COLUMN "studyPlace";

-- CreateTable
CREATE TABLE "TalkSpeaker" (
    "id" TEXT NOT NULL,
    "talkId" TEXT NOT NULL,
    "userId" TEXT,
    "speakerName" TEXT NOT NULL,
    "speakerPhone" TEXT NOT NULL,
    "isProfessional" BOOLEAN NOT NULL DEFAULT false,
    "jobTitle" TEXT,
    "enterprise" TEXT,
    "isStudent" BOOLEAN NOT NULL DEFAULT false,
    "career" TEXT,
    "studyPlace" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TalkSpeaker_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TalkSpeaker_talkId_idx" ON "TalkSpeaker"("talkId");

-- CreateIndex
CREATE INDEX "TalkSpeaker_userId_idx" ON "TalkSpeaker"("userId");

-- CreateIndex
CREATE INDEX "TalkSpeaker_talkId_order_idx" ON "TalkSpeaker"("talkId", "order");

-- AddForeignKey
ALTER TABLE "TalkSpeaker" ADD CONSTRAINT "TalkSpeaker_talkId_fkey" FOREIGN KEY ("talkId") REFERENCES "Talk"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TalkSpeaker" ADD CONSTRAINT "TalkSpeaker_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
