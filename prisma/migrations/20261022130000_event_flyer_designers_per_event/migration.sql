-- Flyer designers are credited once per event instead of per flyer image.

-- Keep one row per designer and event: same account, or same name (case-insensitive) without one.
DELETE FROM "EventFlyerDesigner" d
USING (
  SELECT "id",
         ROW_NUMBER() OVER (
           PARTITION BY "eventId", COALESCE("userId", 'name:' || LOWER("name"))
           ORDER BY "createdAt", "id"
         ) AS rn
  FROM "EventFlyerDesigner"
) ranked
WHERE d."id" = ranked."id" AND ranked.rn > 1;

-- AlterTable
ALTER TABLE "EventFlyerDesigner" DROP COLUMN "flyerSrc";
