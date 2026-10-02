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
CREATE INDEX "EventWaitlistEntry_eventId_cancelledAt_promotedAt_createdAt_idx" ON "EventWaitlistEntry"("eventId", "cancelledAt", "promotedAt", "createdAt");

-- CreateIndex
CREATE INDEX "EventWaitlistEntry_userId_idx" ON "EventWaitlistEntry"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "EventWaitlistEntry_eventId_userId_key" ON "EventWaitlistEntry"("eventId", "userId");

-- AddForeignKey
ALTER TABLE "EventWaitlistEntry" ADD CONSTRAINT "EventWaitlistEntry_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventWaitlistEntry" ADD CONSTRAINT "EventWaitlistEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
