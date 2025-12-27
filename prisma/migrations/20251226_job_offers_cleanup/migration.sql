-- Renombrar enterprise a company
ALTER TABLE "JobOffers" RENAME COLUMN "enterprise" TO "company";

-- Eliminar campos no usados
ALTER TABLE "JobOffers" DROP COLUMN IF EXISTS "logoPath";
ALTER TABLE "JobOffers" DROP COLUMN IF EXISTS "salaryAmount";
ALTER TABLE "JobOffers" DROP COLUMN IF EXISTS "currency";
