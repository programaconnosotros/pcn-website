// Generator de Prisma que escribe el datamodel completo del schema (modelos, campos, relaciones y
// enums) como JSON, junto al cliente, en cada `prisma generate`. El cliente de Prisma 7 ya no
// expone `Prisma.dmmf` y su modelo en runtime no dice qué lado de una relación tiene la clave
// foránea ni si es una lista, que es lo que necesitan el cache (src/lib/prisma-models.ts) y el
// diagrama de /desarrollo (scripts/generate-db-schema.mjs).
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import generatorHelper from '@prisma/generator-helper';

generatorHelper.generatorHandler({
  onManifest: () => ({ prettyName: 'Datamodel JSON', defaultOutput: '../src/generated/datamodel' }),
  onGenerate: async ({ dmmf, generator }) => {
    const dir = generator.output.value;
    mkdirSync(dir, { recursive: true });
    writeFileSync(path.join(dir, 'datamodel.json'), JSON.stringify(dmmf.datamodel, null, 2) + '\n');
  },
});
