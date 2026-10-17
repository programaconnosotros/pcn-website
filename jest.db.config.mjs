import nextJest from 'next/jest.js';

const createJestConfig = nextJest({ dir: './' });

/**
 * Tests de integración (`pnpm test:db`): server actions contra un Postgres real, en una base
 * descartable que se crea con las migraciones (src/test/db). Más lentos que `pnpm test`, que
 * reemplaza Prisma por un mock.
 */
/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/**/*.db.test.ts'],
  globalSetup: '<rootDir>/src/test/db/global-setup.mjs',
  globalTeardown: '<rootDir>/src/test/db/global-teardown.mjs',
  setupFiles: ['<rootDir>/src/test/db/env.ts'],
  setupFilesAfterEnv: ['<rootDir>/src/test/db/setup.ts'],
  // Todos comparten la base: de a un archivo por vez, así un test no ve las filas de otro a medias.
  maxWorkers: 1,
  testTimeout: 30_000,
  clearMocks: true,
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@actions/(.*)$': '<rootDir>/src/actions/$1',
  },
};

// Prisma 7 carga su query compiler con un import() dinámico de archivos .mjs, que Jest (CommonJS)
// no puede ejecutar: se transpilan como el resto del código en vez de saltearlos con node_modules.
const PNPM_DIR = String.raw`\.pnpm[\\/]`;
const PRISMA_RUNTIME = String.raw`(?!@prisma[\\/]client[\\/]runtime[\\/])`;
const PNPM_PRISMA_RUNTIME = String.raw`(?!@prisma\+client@[^\\/]+[\\/]node_modules[\\/]@prisma[\\/]client[\\/]runtime[\\/])`;

const jestConfig = async () => {
  const resolved = await createJestConfig(config)();
  return {
    ...resolved,
    transformIgnorePatterns: resolved.transformIgnorePatterns.map((pattern) =>
      pattern
        .replace('(?!.pnpm)', `(?!.pnpm)${PRISMA_RUNTIME}`)
        .replace(PNPM_DIR, PNPM_DIR + PNPM_PRISMA_RUNTIME),
    ),
  };
};

export default jestConfig;
