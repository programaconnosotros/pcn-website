-- Events keep a Google Maps link instead of raw coordinates.
ALTER TABLE "Event" ADD COLUMN "googleMapsUrl" TEXT;

-- Keep every location already saved: turn the coordinates into a Maps link.
UPDATE "Event"
SET "googleMapsUrl" = 'https://www.google.com/maps?q=' || "latitude"::text || ',' || "longitude"::text
WHERE "latitude" IS NOT NULL AND "longitude" IS NOT NULL;

ALTER TABLE "Event" DROP COLUMN "latitude",
DROP COLUMN "longitude";
