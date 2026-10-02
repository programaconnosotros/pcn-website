import { prismaMock } from '@/test/prisma';
import { mockCookies } from '@/test/cookies';
import {
  SESSION_MAX_AGE_SECONDS,
  createSession,
  deleteCurrentSession,
  findSession,
} from './session';

describe('findSession', () => {
  it('only matches sessions that have not expired', async () => {
    prismaMock.session.findUnique.mockResolvedValue(null);

    await findSession('session-1');

    expect(prismaMock.session.findUnique).toHaveBeenCalledWith({
      where: { id: 'session-1', expires: { gt: expect.any(Date) } },
      include: { user: true },
    });
  });
});

describe('createSession', () => {
  it('creates a session that expires with its cookie', async () => {
    const store = mockCookies();
    prismaMock.session.create.mockResolvedValue({ id: 'session-new' } as any);
    const before = Date.now();

    await createSession('user-1');

    const { data } = prismaMock.session.create.mock.calls[0][0];
    expect(data.userId).toBe('user-1');
    expect((data.expires as Date).getTime()).toBeGreaterThanOrEqual(
      before + SESSION_MAX_AGE_SECONDS * 1000,
    );
    expect(store.set).toHaveBeenCalledWith(
      'sessionId',
      'session-new',
      expect.objectContaining({ httpOnly: true, maxAge: SESSION_MAX_AGE_SECONDS }),
    );
  });

  it("clears the user's expired sessions", async () => {
    mockCookies();
    prismaMock.session.create.mockResolvedValue({ id: 'session-new' } as any);

    await createSession('user-1');

    expect(prismaMock.session.deleteMany).toHaveBeenCalledWith({
      where: { userId: 'user-1', expires: { lte: expect.any(Date) } },
    });
  });
});

describe('deleteCurrentSession', () => {
  it('deletes the session row and the cookie', async () => {
    const store = mockCookies({ sessionId: 'session-1' });

    await deleteCurrentSession();

    expect(prismaMock.session.deleteMany).toHaveBeenCalledWith({ where: { id: 'session-1' } });
    expect(store.delete).toHaveBeenCalledWith('sessionId');
  });
});
