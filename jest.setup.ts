import { mockReset } from 'jest-mock-extended';
import type { DeepMockProxy } from 'jest-mock-extended';
import type { PrismaClient } from '@prisma/client';

// ─── Prisma ──────────────────────────────────────────────────────────────────
// Use require() inside the factory to avoid jest.mock hoisting issues with
// top-level imports; the factory runs once per test file's module registry.
jest.mock('@/lib/prisma', () => {
  const { mockDeep } = require('jest-mock-extended');
  return {
    __esModule: true,
    default: mockDeep(),
  };
});

const prismaMock: DeepMockProxy<PrismaClient> = jest.requireMock('@/lib/prisma').default;

// ─── Next.js server APIs ─────────────────────────────────────────────────────
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
  revalidateTag: jest.fn(),
}));

// redirect() normally throws to interrupt control flow; replicate that here so
// tests can assert on it with .rejects.toThrow('NEXT_REDIRECT:/some/path')
jest.mock('next/navigation', () => ({
  redirect: jest.fn().mockImplementation((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
}));

// cookies() and headers() are async in Next.js 15+; individual tests call
// mockCookies() / mockHeaders() from src/test/cookies.ts|headers.ts to
// configure their resolved values per scenario.
jest.mock('next/headers', () => ({
  cookies: jest.fn(),
  headers: jest.fn(),
}));

// ─── Reset mocks between tests ───────────────────────────────────────────────
beforeEach(() => {
  mockReset(prismaMock);
});

// ─── Silence console.error in test output ────────────────────────────────────
// Server actions log to console.error in catch blocks; the action tests
// intentionally hit those paths, which otherwise floods the test output.
// Kept as a spy (not deleted) so tests can still assert on calls if needed.
let consoleErrorSpy: jest.SpyInstance;

beforeAll(() => {
  consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  consoleErrorSpy.mockRestore();
});
