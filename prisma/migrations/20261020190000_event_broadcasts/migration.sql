-- CreateTable
CREATE TABLE "EventBroadcast" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "authorId" TEXT,
    "audience" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "recipients" INTEGER NOT NULL,
    "failed" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventBroadcast_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EventBroadcast_eventId_createdAt_idx" ON "EventBroadcast"("eventId", "createdAt");

-- CreateIndex
CREATE INDEX "EventBroadcast_authorId_idx" ON "EventBroadcast"("authorId");

-- AddForeignKey
ALTER TABLE "EventBroadcast" ADD CONSTRAINT "EventBroadcast_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventBroadcast" ADD CONSTRAINT "EventBroadcast_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
