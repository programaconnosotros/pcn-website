-- Add flyerImages array column with empty default
ALTER TABLE "Event" ADD COLUMN "flyerImages" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- Backfill: copy existing flyerSrc into flyerImages as a single-element array
UPDATE "Event" SET "flyerImages" = ARRAY["flyerSrc"] WHERE "flyerSrc" IS NOT NULL AND "flyerSrc" <> '';

-- Drop the old flyerSrc column
ALTER TABLE "Event" DROP COLUMN "flyerSrc";
