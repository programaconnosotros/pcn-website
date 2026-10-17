-- CreateEnum
CREATE TYPE "GalleryItemKind" AS ENUM ('PHOTO', 'VIDEO');

-- AlterTable
ALTER TABLE "GalleryItem" ADD COLUMN     "durationSeconds" INTEGER,
ADD COLUMN     "kind" "GalleryItemKind" NOT NULL DEFAULT 'PHOTO',
ADD COLUMN     "mimeType" TEXT;

