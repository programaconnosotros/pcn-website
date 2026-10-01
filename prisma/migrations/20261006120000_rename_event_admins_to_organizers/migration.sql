-- Los administradores de un evento pasan a ser sus organizadores.
ALTER TABLE "EventAdmin" RENAME TO "EventOrganizer";
ALTER TABLE "EventOrganizer" RENAME CONSTRAINT "EventAdmin_pkey" TO "EventOrganizer_pkey";
ALTER TABLE "EventOrganizer" RENAME CONSTRAINT "EventAdmin_eventId_fkey" TO "EventOrganizer_eventId_fkey";
ALTER TABLE "EventOrganizer" RENAME CONSTRAINT "EventAdmin_userId_fkey" TO "EventOrganizer_userId_fkey";
ALTER INDEX "EventAdmin_userId_idx" RENAME TO "EventOrganizer_userId_idx";
ALTER INDEX "EventAdmin_eventId_userId_key" RENAME TO "EventOrganizer_eventId_userId_key";

-- Quien creó cada evento también lo organizó.
INSERT INTO "EventOrganizer" ("id", "eventId", "userId", "createdAt")
SELECT gen_random_uuid()::text, "id", "createdById", "createdAt"
FROM "Event"
WHERE "createdById" IS NOT NULL
ON CONFLICT ("eventId", "userId") DO NOTHING;
