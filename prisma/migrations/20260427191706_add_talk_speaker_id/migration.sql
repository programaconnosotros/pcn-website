-- AlterTable
ALTER TABLE "Talk" ADD COLUMN     "speakerId" TEXT;

-- CreateIndex
CREATE INDEX "Talk_speakerId_idx" ON "Talk"("speakerId");

-- AddForeignKey
ALTER TABLE "Talk" ADD CONSTRAINT "Talk_speakerId_fkey" FOREIGN KEY ("speakerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
