/*
  Warnings:

  - You are about to drop the column `career` on the `TalkProposal` table. All the data in the column will be lost.
  - You are about to drop the column `enterprise` on the `TalkProposal` table. All the data in the column will be lost.
  - You are about to drop the column `isProfessional` on the `TalkProposal` table. All the data in the column will be lost.
  - You are about to drop the column `isStudent` on the `TalkProposal` table. All the data in the column will be lost.
  - You are about to drop the column `jobTitle` on the `TalkProposal` table. All the data in the column will be lost.
  - You are about to drop the column `speakerName` on the `TalkProposal` table. All the data in the column will be lost.
  - You are about to drop the column `speakerPhone` on the `TalkProposal` table. All the data in the column will be lost.
  - You are about to drop the column `studyPlace` on the `TalkProposal` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TalkProposal" DROP COLUMN "career",
DROP COLUMN "enterprise",
DROP COLUMN "isProfessional",
DROP COLUMN "isStudent",
DROP COLUMN "jobTitle",
DROP COLUMN "speakerName",
DROP COLUMN "speakerPhone",
DROP COLUMN "studyPlace";

-- CreateTable
CREATE TABLE "TalkProposalSpeaker" (
    "id" TEXT NOT NULL,
    "talkProposalId" TEXT NOT NULL,
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

    CONSTRAINT "TalkProposalSpeaker_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TalkProposalSpeaker_talkProposalId_idx" ON "TalkProposalSpeaker"("talkProposalId");

-- CreateIndex
CREATE INDEX "TalkProposalSpeaker_userId_idx" ON "TalkProposalSpeaker"("userId");

-- CreateIndex
CREATE INDEX "TalkProposalSpeaker_talkProposalId_order_idx" ON "TalkProposalSpeaker"("talkProposalId", "order");

-- AddForeignKey
ALTER TABLE "TalkProposalSpeaker" ADD CONSTRAINT "TalkProposalSpeaker_talkProposalId_fkey" FOREIGN KEY ("talkProposalId") REFERENCES "TalkProposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TalkProposalSpeaker" ADD CONSTRAINT "TalkProposalSpeaker_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
