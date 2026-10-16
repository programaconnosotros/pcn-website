import { prismaMock } from '@/test/prisma';
import { hashSessionToken } from '@/lib/session';
import { mockCookies } from '@/test/cookies';
import { signOut } from './sign-out';

describe('signOut', () => {
  it('deletes the session row and cookie and resolves, so the caller can navigate', async () => {
    const store = mockCookies({ sessionId: 'abc' });

    await expect(signOut()).resolves.toEqual({ success: true });

    expect(prismaMock.session.deleteMany).toHaveBeenCalledWith({
      where: { id: hashSessionToken('abc') },
    });
    expect(store.delete).toHaveBeenCalledWith('sessionId');
  });

  it('still clears the cookie when there is no session', async () => {
    const store = mockCookies();

    await expect(signOut()).resolves.toEqual({ success: true });

    expect(store.delete).toHaveBeenCalledWith('sessionId');
    expect(prismaMock.session.deleteMany).not.toHaveBeenCalled();
  });
});
