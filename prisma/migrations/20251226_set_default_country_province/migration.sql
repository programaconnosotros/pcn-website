-- Actualizar usuarios existentes sin país
UPDATE "User" 
SET "countryOfOrigin" = 'Argentina', "province" = 'Tucumán'
WHERE "countryOfOrigin" IS NULL;
