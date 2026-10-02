import { prismaMock } from '@/test/prisma';
import { mockCookies } from '@/test/cookies';
import { mockHeaders } from '@/test/headers';

jest.unmock('@/lib/rate-limit');

import {
  RATE_LIMITS,
  RateLimitError,
  consumeRateLimit,
  enforceRateLimit,
  resetRateLimits,
} from './rate-limit';

const rule = { limit: 2, windowSeconds: 60 };

beforeEach(() => {
  resetRateLimits();
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2026-01-01T00:00:00Z'));
});

afterEach(() => {
  jest.useRealTimers();
});

describe('consumeRateLimit', () => {
  it('allows hits up to the limit and then returns the seconds to wait', () => {
    expect(consumeRateLimit('k', rule)).toBe(0);
    jest.advanceTimersByTime(10_000);
    expect(consumeRateLimit('k', rule)).toBe(0);
    expect(consumeRateLimit('k', rule)).toBe(50);
  });

  it('frees slots once they leave the window', () => {
    consumeRateLimit('k', rule);
    consumeRateLimit('k', rule);
    jest.advanceTimersByTime(60_001);
    expect(consumeRateLimit('k', rule)).toBe(0);
  });

  it('tracks keys independently', () => {
    consumeRateLimit('a', rule);
    consumeRateLimit('a', rule);
    expect(consumeRateLimit('b', rule)).toBe(0);
  });
});

describe('enforceRateLimit', () => {
  const exhaust = async (name: keyof typeof RATE_LIMITS) => {
    for (let i = 0; i < RATE_LIMITS[name].limit; i++) await enforceRateLimit(name);
  };

  it('limits anonymous visitors by IP', async () => {
    mockCookies();
    mockHeaders({ 'x-forwarded-for': '1.2.3.4, 10.0.0.1' });

    await exhaust('signUp');
    await expect(enforceRateLimit('signUp')).rejects.toThrow(/^RATE_LIMIT:signUp:\d+$/);

    mockHeaders({ 'x-forwarded-for': '5.6.7.8' });
    await expect(enforceRateLimit('signUp')).resolves.toBeUndefined();
  });

  it('ignores client-written x-forwarded-for entries before the proxy hop', async () => {
    mockCookies();
    mockHeaders({ 'x-forwarded-for': '1.1.1.1, 9.9.9.9' });

    await exhaust('signUp');

    mockHeaders({ 'x-forwarded-for': '2.2.2.2, 9.9.9.9' });
    await expect(enforceRateLimit('signUp')).rejects.toThrow(/^RATE_LIMIT:signUp:\d+$/);
  });

  it('throws a RateLimitError whose digest carries the form and the wait', async () => {
    // El digest es lo que Next manda al navegador en producción, donde el mensaje no llega
    mockCookies();
    mockHeaders({ 'x-forwarded-for': '7.7.7.7' });
    await exhaust('signUp');

    const error = await enforceRateLimit('signUp').catch((caught) => caught);

    expect(error).toBeInstanceOf(RateLimitError);
    expect(error.limit).toBe('signUp');
    expect(error.waitSeconds).toBeGreaterThan(0);
    expect(error.digest).toBe(`RATE_LIMIT:signUp:${error.waitSeconds}`);
  });

  it('limits logged-in users by user id', async () => {
    mockCookies({ sessionId: 'session-1' });
    mockHeaders();
    prismaMock.session.findUnique.mockResolvedValue({
      user: { id: 'user-1', role: 'USER' },
    } as never);

    await exhaust('comment');
    await expect(enforceRateLimit('comment')).rejects.toThrow(/^RATE_LIMIT:comment:\d+$/);
  });

  it('never limits admins', async () => {
    mockCookies({ sessionId: 'session-1' });
    mockHeaders();
    prismaMock.session.findUnique.mockResolvedValue({
      user: { id: 'admin-1', role: 'ADMIN' },
    } as never);

    await exhaust('comment');
    await expect(enforceRateLimit('comment')).resolves.toBeUndefined();
  });
});
