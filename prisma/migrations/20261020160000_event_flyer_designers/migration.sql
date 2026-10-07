-- CreateTable
CREATE TABLE "EventFlyerDesigner" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "flyerSrc" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventFlyerDesigner_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EventFlyerDesigner_eventId_idx" ON "EventFlyerDesigner"("eventId");

-- CreateIndex
CREATE INDEX "EventFlyerDesigner_userId_idx" ON "EventFlyerDesigner"("userId");

-- AddForeignKey
ALTER TABLE "EventFlyerDesigner" ADD CONSTRAINT "EventFlyerDesigner_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventFlyerDesigner" ADD CONSTRAINT "EventFlyerDesigner_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
