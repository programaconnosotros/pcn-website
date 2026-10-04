import { createRequire } from 'node:module';
import nextJest from 'next/jest.js';

const require = createRequire(import.meta.url);

const createJestConfig = nextJest({
  // Provides next.config.mjs and .env files to the test environment
  dir: './',
});

/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  // Scope to src/ only — keeps Playwright tests/example.spec.ts out of Jest
  testMatch: ['<rootDir>/src/**/*.test.ts'],
  clearMocks: true,
  // next/jest can't parse JSONC comments in tsconfig.json so path aliases are
  // not auto-generated; list them here explicitly.
  // NOTE: @prisma/* is intentionally omitted — @prisma/client must resolve
  // to node_modules, not ./prisma/.
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@actions/(.*)$': '<rootDir>/src/actions/$1',
    // tsconfig's `@prisma/*` alias makes next/jest rewrite a runtime `@prisma/client` import to
    // ./prisma/client, which doesn't exist (tsc falls back to node_modules, Jest doesn't).
    '^(\\.\\./)+prisma/client$': require.resolve('@prisma/client'),
  },
};

export default createJestConfig(config);
