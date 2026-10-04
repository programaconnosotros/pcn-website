import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    // Las migraciones van por la conexión directa (sin pooler) cuando la hay. `prisma generate`
    // no necesita base, así que no se exige ninguna de las dos (el build de Docker no las tiene).
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
  },
});
