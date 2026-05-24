-- AlterTable
ALTER TABLE "Talk"
ADD COLUMN "manualEventTitle" TEXT,
ADD COLUMN "manualEventDate" TIMESTAMP(3),
ADD COLUMN "manualEventLocation" TEXT;
