-- CreateEnum
CREATE TYPE "TalkProposalStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "callForTalksEnabled" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "TalkProposal" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "speakerName" TEXT NOT NULL,
    "speakerPhone" TEXT NOT NULL,
    "isProfessional" BOOLEAN NOT NULL DEFAULT false,
    "jobTitle" TEXT,
    "enterprise" TEXT,
    "isStudent" BOOLEAN NOT NULL DEFAULT false,
    "career" TEXT,
    "studyPlace" TEXT,
    "status" "TalkProposalStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TalkProposal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TalkProposal_eventId_idx" ON "TalkProposal"("eventId");

-- CreateIndex
CREATE INDEX "TalkProposal_userId_idx" ON "TalkProposal"("userId");

-- CreateIndex
CREATE INDEX "TalkProposal_status_idx" ON "TalkProposal"("status");

-- AddForeignKey
ALTER TABLE "TalkProposal" ADD CONSTRAINT "TalkProposal_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TalkProposal" ADD CONSTRAINT "TalkProposal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
