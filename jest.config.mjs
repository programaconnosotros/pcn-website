import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  // Provides next.config.mjs and .env files to the test environment
  dir: './',
});

const shared = {
  clearMocks: true,
  // next/jest can't parse JSONC comments in tsconfig.json so path aliases are
  // not auto-generated; list them here explicitly.
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@actions/(.*)$': '<rootDir>/src/actions/$1',
  },
};

/**
 * Two projects:
 * - node: `*.test.ts` — lib, schemas, server actions and route handlers, with Prisma, cookies()
 *   and headers() mocked by jest.setup.ts.
 * - dom: `*.test.tsx` — React components rendered with Testing Library in jsdom
 *   (jest.setup.dom.ts mocks the Next router and the browser APIs jsdom lacks).
 * The integration suite against Postgres runs apart with `pnpm test:db` (jest.db.config.mjs).
 */
const node = createJestConfig({
  ...shared,
  displayName: 'node',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  // Scope to src/ only — keeps the Playwright specs in tests/ out of Jest
  testMatch: ['<rootDir>/src/**/*.test.ts'],
  testPathIgnorePatterns: ['/node_modules/', '\\.db\\.test\\.ts$'],
});

const dom = createJestConfig({
  ...shared,
  displayName: 'dom',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.dom.ts'],
  testMatch: ['<rootDir>/src/**/*.test.tsx'],
});

const jestConfig = async () => ({
  projects: [await node(), await dom()],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.test.{ts,tsx}',
    '!src/generated/**',
    '!src/test/**',
    '!src/scripts/**',
    '!src/**/*.d.ts',
  ],
  coverageReporters: ['text-summary', 'json-summary', 'html'],
});

export default jestConfig;
