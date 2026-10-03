-- AlterTable
ALTER TABLE "Event" ADD COLUMN "coverPhotoId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Event_coverPhotoId_key" ON "Event"("coverPhotoId");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_coverPhotoId_fkey" FOREIGN KEY ("coverPhotoId") REFERENCES "GalleryItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
