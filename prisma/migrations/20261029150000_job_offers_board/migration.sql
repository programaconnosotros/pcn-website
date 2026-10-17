-- AlterTable
ALTER TABLE "JobOffers" ALTER COLUMN "available" SET DEFAULT true,
ADD COLUMN     "applyUrl" TEXT,
ADD COLUMN     "authorId" TEXT,
ADD COLUMN     "modality" TEXT NOT NULL DEFAULT 'remoto',
ADD COLUMN     "seniority" TEXT;

-- CreateIndex
CREATE INDEX "JobOffers_available_createdAt_idx" ON "JobOffers"("available", "createdAt");

-- CreateIndex
CREATE INDEX "JobOffers_authorId_idx" ON "JobOffers"("authorId");

-- AddForeignKey
ALTER TABLE "JobOffers" ADD CONSTRAINT "JobOffers_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
