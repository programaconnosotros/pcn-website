import { headers } from 'next/headers';

export interface MockHeaderStore {
  get: jest.Mock;
  has: jest.Mock;
}

/**
 * Configure the globally-mocked `headers()` from `next/headers` to return
 * a header store pre-populated with the given key/value pairs.
 *
 * Usage:
 *   mockHeaders({ 'x-forwarded-for': '1.2.3.4', 'user-agent': 'Jest' });
 */
export function mockHeaders(values: Record<string, string | undefined> = {}): MockHeaderStore {
  const store: MockHeaderStore = {
    get: jest.fn((name: string) => values[name.toLowerCase()] ?? null),
    has: jest.fn((name: string) => name.toLowerCase() in values),
  };
  (headers as jest.Mock).mockResolvedValue(store);
  return store;
}
