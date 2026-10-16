-- CreateTable
CREATE TABLE "SponsorClick" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "eventId" TEXT,
    "source" TEXT NOT NULL,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SponsorClick_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SponsorClick_name_idx" ON "SponsorClick"("name");

-- CreateIndex
CREATE INDEX "SponsorClick_eventId_idx" ON "SponsorClick"("eventId");

-- CreateIndex
CREATE INDEX "SponsorClick_createdAt_idx" ON "SponsorClick"("createdAt");

-- AddForeignKey
ALTER TABLE "SponsorClick" ADD CONSTRAINT "SponsorClick_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SponsorClick" ADD CONSTRAINT "SponsorClick_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
