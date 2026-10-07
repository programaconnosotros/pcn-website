import { prismaMock } from '@/test/prisma';
import { mockCookies } from '@/test/cookies';
import { setSuspended } from './set-suspended';

const admin = { id: 'admin-1', name: 'Admin', email: 'admin@pcn.com', role: 'ADMIN' as const };
const regular = { ...admin, id: 'user-1', role: 'REGULAR' as const };

const loginAs = (user: typeof admin | typeof regular) => {
  mockCookies({ sessionId: `session-${user.id}` });
  prismaMock.session.findUnique.mockResolvedValue({ id: 's', userId: user.id, user } as any);
};

describe('setSuspended', () => {
  it('only lets admins suspend accounts', async () => {
    loginAs(regular);

    await expect(setSuspended('user-2', true)).rejects.toThrow('No autorizado');
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it('suspends an account and logs it out everywhere', async () => {
    loginAs(admin);
    prismaMock.user.findUnique.mockResolvedValue({ id: 'user-2', role: 'REGULAR' } as any);

    await expect(setSuspended('user-2', true)).resolves.toEqual({ success: true });

    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: 'user-2' },
      data: { suspendedAt: expect.any(Date) },
    });
    expect(prismaMock.session.deleteMany).toHaveBeenCalledWith({ where: { userId: 'user-2' } });
  });

  it('lifts a suspension without touching sessions', async () => {
    loginAs(admin);
    prismaMock.user.findUnique.mockResolvedValue({ id: 'user-2', role: 'REGULAR' } as any);

    await setSuspended('user-2', false);

    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: 'user-2' },
      data: { suspendedAt: null },
    });
    expect(prismaMock.session.deleteMany).not.toHaveBeenCalled();
  });

  it('does not let admins suspend themselves or other admins', async () => {
    loginAs(admin);

    await expect(setSuspended('admin-1', true)).resolves.toEqual({
      success: false,
      error: 'No podés suspender tu propia cuenta',
    });

    prismaMock.user.findUnique.mockResolvedValue({ id: 'admin-2', role: 'ADMIN' } as any);
    await expect(setSuspended('admin-2', true)).resolves.toEqual({
      success: false,
      error: 'Quitale el rol de admin antes de suspenderlo',
    });
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it('fails for a user that does not exist or a malformed request', async () => {
    loginAs(admin);
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(setSuspended('no-existe', true)).rejects.toThrow('Usuario no encontrado');
    await expect(setSuspended('user-2', 'sí' as any)).rejects.toThrow();
  });
});
