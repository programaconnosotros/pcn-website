-- La galería pasa a tener fotos y videos: Photo → GalleryItem, PhotoTag → GalleryItemTag.
-- Se renombra en el lugar para conservar los datos.
ALTER TABLE "Photo" RENAME TO "GalleryItem";
ALTER TABLE "GalleryItem" RENAME CONSTRAINT "Photo_pkey" TO "GalleryItem_pkey";
ALTER TABLE "GalleryItem" RENAME CONSTRAINT "Photo_eventId_fkey" TO "GalleryItem_eventId_fkey";
ALTER TABLE "GalleryItem" RENAME CONSTRAINT "Photo_uploadedById_fkey" TO "GalleryItem_uploadedById_fkey";
ALTER INDEX "Photo_legacyId_key" RENAME TO "GalleryItem_legacyId_key";
ALTER INDEX "Photo_takenAt_idx" RENAME TO "GalleryItem_takenAt_idx";
ALTER INDEX "Photo_eventId_idx" RENAME TO "GalleryItem_eventId_idx";

ALTER TABLE "PhotoTag" RENAME TO "GalleryItemTag";
ALTER TABLE "GalleryItemTag" RENAME COLUMN "photoId" TO "itemId";
ALTER TABLE "GalleryItemTag" RENAME CONSTRAINT "PhotoTag_pkey" TO "GalleryItemTag_pkey";
ALTER TABLE "GalleryItemTag" RENAME CONSTRAINT "PhotoTag_photoId_fkey" TO "GalleryItemTag_itemId_fkey";
ALTER TABLE "GalleryItemTag" RENAME CONSTRAINT "PhotoTag_userId_fkey" TO "GalleryItemTag_userId_fkey";
ALTER TABLE "GalleryItemTag" RENAME CONSTRAINT "PhotoTag_taggedById_fkey" TO "GalleryItemTag_taggedById_fkey";
ALTER INDEX "PhotoTag_userId_idx" RENAME TO "GalleryItemTag_userId_idx";
ALTER INDEX "PhotoTag_photoId_userId_key" RENAME TO "GalleryItemTag_itemId_userId_key";
