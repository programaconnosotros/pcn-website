-- CreateTable
CREATE TABLE "Talk" (
    "id" TEXT NOT NULL,
    "eventId" TEXT,
    "proposalId" TEXT,
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
    "order" INTEGER NOT NULL DEFAULT 0,
    "slidesUrl" TEXT,
    "videoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Talk_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Talk_proposalId_key" ON "Talk"("proposalId");

-- CreateIndex
CREATE INDEX "Talk_eventId_idx" ON "Talk"("eventId");

-- CreateIndex
CREATE INDEX "Talk_order_idx" ON "Talk"("order");

-- AddForeignKey
ALTER TABLE "Talk" ADD CONSTRAINT "Talk_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Talk" ADD CONSTRAINT "Talk_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "TalkProposal"("id") ON DELETE SET NULL ON UPDATE CASCADE;
