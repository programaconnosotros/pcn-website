-- AlterTable
ALTER TABLE "EventRegistration" ADD COLUMN     "cancelledAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "EventRegistration_cancelledAt_idx" ON "EventRegistration"("cancelledAt");
