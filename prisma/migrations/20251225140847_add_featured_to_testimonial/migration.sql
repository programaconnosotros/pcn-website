-- AlterTable
ALTER TABLE "Testimonial" ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Testimonial_featured_idx" ON "Testimonial"("featured");
