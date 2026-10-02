import { prismaMock } from '@/test/prisma';
import { mockCookies } from '@/test/cookies';
import {
  SESSION_MAX_AGE_SECONDS,
  createSession,
  deleteCurrentSession,
  findSession,
  hashSessionToken,
} from './session';

describe('hashSessionToken', () => {
  it('is a stable sha256 hex digest that differs from the token', () => {
    const hash = hashSessionToken('token-1');

    expect(hash).toMatch(/^[0-9a-f]{64}$/);
    expect(hash).toBe(hashSessionToken('token-1'));
    expect(hash).not.toBe(hashSessionToken('token-2'));
  });
});

describe('findSession', () => {
  it('looks up the hashed token and only matches sessions that have not expired', async () => {
    prismaMock.session.findUnique.mockResolvedValue(null);

    await findSession('token-1');

    expect(prismaMock.session.findUnique).toHaveBeenCalledWith({
      where: { id: hashSessionToken('token-1'), expires: { gt: expect.any(Date) } },
      include: { user: true },
    });
  });
});

describe('createSession', () => {
  it('stores the hash of a random token and puts the token in the cookie', async () => {
    const store = mockCookies();
    prismaMock.session.create.mockResolvedValue({ id: 'hash' } as any);
    const before = Date.now();

    await createSession('user-1');

    const [, token, options] = store.set.mock.calls[0];
    const { data } = prismaMock.session.create.mock.calls[0][0];
    expect(token).toMatch(/^[\w-]{43}$/);
    expect(data.id).toBe(hashSessionToken(token));
    expect(data.userId).toBe('user-1');
    expect((data.expires as Date).getTime()).toBeGreaterThanOrEqual(
      before + SESSION_MAX_AGE_SECONDS * 1000,
    );
    expect(store.set).toHaveBeenCalledWith(
      'sessionId',
      token,
      expect.objectContaining({ httpOnly: true, maxAge: SESSION_MAX_AGE_SECONDS }),
    );
    expect(options.maxAge).toBe(SESSION_MAX_AGE_SECONDS);
  });

  it('uses a different token every time', async () => {
    const store = mockCookies();
    prismaMock.session.create.mockResolvedValue({ id: 'hash' } as any);

    await createSession('user-1');
    await createSession('user-1');

    expect(store.set.mock.calls[0][1]).not.toBe(store.set.mock.calls[1][1]);
  });

  it("clears the user's expired sessions", async () => {
    mockCookies();
    prismaMock.session.create.mockResolvedValue({ id: 'hash' } as any);

    await createSession('user-1');

    expect(prismaMock.session.deleteMany).toHaveBeenCalledWith({
      where: { userId: 'user-1', expires: { lte: expect.any(Date) } },
    });
  });
});

describe('deleteCurrentSession', () => {
  it('deletes the session row and the cookie', async () => {
    const store = mockCookies({ sessionId: 'token-1' });

    await deleteCurrentSession();

    expect(prismaMock.session.deleteMany).toHaveBeenCalledWith({
      where: { id: hashSessionToken('token-1') },
    });
    expect(store.delete).toHaveBeenCalledWith('sessionId');
  });
});
