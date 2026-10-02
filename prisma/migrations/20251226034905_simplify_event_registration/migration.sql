-- Simplificar EventRegistration: eliminar campos redundantes
-- Los datos ahora se obtienen del User relacionado

-- Primero, eliminar registros que no tengan userId (ya que ahora es requerido)
DELETE FROM "EventRegistration" WHERE "userId" IS NULL;

-- Eliminar el índice y constraint existentes
DROP INDEX IF EXISTS "EventRegistration_eventId_email_key";

-- Eliminar columnas redundantes
ALTER TABLE "EventRegistration" DROP COLUMN IF EXISTS "firstName";
ALTER TABLE "EventRegistration" DROP COLUMN IF EXISTS "lastName";
ALTER TABLE "EventRegistration" DROP COLUMN IF EXISTS "email";
ALTER TABLE "EventRegistration" DROP COLUMN IF EXISTS "type";
ALTER TABLE "EventRegistration" DROP COLUMN IF EXISTS "workTitle";
ALTER TABLE "EventRegistration" DROP COLUMN IF EXISTS "workPlace";
ALTER TABLE "EventRegistration" DROP COLUMN IF EXISTS "studyField";
ALTER TABLE "EventRegistration" DROP COLUMN IF EXISTS "studyPlace";

-- Hacer userId requerido
ALTER TABLE "EventRegistration" ALTER COLUMN "userId" SET NOT NULL;

-- Cambiar la relación de SetNull a Cascade (ya que userId es requerido)
ALTER TABLE "EventRegistration" DROP CONSTRAINT IF EXISTS "EventRegistration_userId_fkey";
ALTER TABLE "EventRegistration" ADD CONSTRAINT "EventRegistration_userId_fkey" 
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Crear nuevo constraint unique para eventId + userId
ALTER TABLE "EventRegistration" ADD CONSTRAINT "EventRegistration_eventId_userId_key" UNIQUE ("eventId", "userId");


