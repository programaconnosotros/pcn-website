import { cookies } from 'next/headers';

export interface MockCookieStore {
  get: jest.Mock;
  set: jest.Mock;
  has: jest.Mock;
  delete: jest.Mock;
}

/**
 * Configure the globally-mocked `cookies()` from `next/headers` to return
 * a cookie store pre-populated with the given key/value pairs.
 *
 * Returns the store so you can inspect `.set` calls after the action runs.
 *
 * Usage:
 *   // Authenticated request
 *   const { set } = mockCookies({ sessionId: 'session-123' });
 *
 *   // Anonymous request (no sessionId)
 *   mockCookies();
 */
export function mockCookies(values: Record<string, string | undefined> = {}): MockCookieStore {
  const store: MockCookieStore = {
    get: jest.fn((name: string) => {
      const value = values[name];
      return value !== undefined ? { name, value } : undefined;
    }),
    set: jest.fn(),
    has: jest.fn((name: string) => name in values),
    delete: jest.fn(),
  };
  (cookies as jest.Mock).mockResolvedValue(store);
  return store;
}
