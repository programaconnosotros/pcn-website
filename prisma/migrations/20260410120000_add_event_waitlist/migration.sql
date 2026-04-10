-- CreateTable
CREATE TABLE "EventWaitlistEntry" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cancelledAt" TIMESTAMP(3),
    "promotedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventWaitlistEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EventWaitlistEntry_eventId_idx" ON "EventWaitlistEntry"("eventId");

-- CreateIndex
CREATE INDEX "EventWaitlistEntry_userId_idx" ON "EventWaitlistEntry"("userId");

-- CreateIndex
CREATE INDEX "EventWaitlistEntry_cancelledAt_idx" ON "EventWaitlistEntry"("cancelledAt");

-- CreateIndex
CREATE INDEX "EventWaitlistEntry_promotedAt_idx" ON "EventWaitlistEntry"("promotedAt");

-- CreateIndex
CREATE UNIQUE INDEX "EventWaitlistEntry_eventId_userId_key" ON "EventWaitlistEntry"("eventId", "userId");

-- AddForeignKey
ALTER TABLE "EventWaitlistEntry" ADD CONSTRAINT "EventWaitlistEntry_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventWaitlistEntry" ADD CONSTRAINT "EventWaitlistEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
