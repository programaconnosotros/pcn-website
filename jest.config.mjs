import nextJest from 'next/jest.js';

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
  },
};

export default createJestConfig(config);
