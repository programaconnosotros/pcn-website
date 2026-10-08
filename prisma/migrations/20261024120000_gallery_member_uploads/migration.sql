-- CreateEnum
CREATE TYPE "GalleryItemStatus" AS ENUM ('PENDING', 'APPROVED');

-- AlterTable
ALTER TABLE "GalleryItem" ADD COLUMN     "status" "GalleryItemStatus" NOT NULL DEFAULT 'APPROVED',
ADD COLUMN     "working" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "GalleryItem_status_idx" ON "GalleryItem"("status");
