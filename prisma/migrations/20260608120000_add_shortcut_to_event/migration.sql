-- AlterTable
ALTER TABLE "Event" ADD COLUMN "shortcut" TEXT;

-- CreateIndex
CREATE INDEX "Event_shortcut_idx" ON "Event"("shortcut");
