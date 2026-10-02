import { prismaMock } from '@/test/prisma';
import { mockCookies } from '@/test/cookies';
import { setUserRole } from './set-user-role';

const admin = { id: 'admin-1', name: 'Admin', email: 'admin@pcn.com', role: 'ADMIN' as const };
const regular = { ...admin, id: 'user-1', role: 'REGULAR' as const };

const loginAs = (user: typeof admin | typeof regular) => {
  mockCookies({ sessionId: `session-${user.id}` });
  prismaMock.session.findUnique.mockResolvedValue({ id: 's', userId: user.id, user } as any);
};

describe('setUserRole', () => {
  it('only lets admins change roles', async () => {
    loginAs(regular);

    await expect(setUserRole('user-1', 'ADMIN')).rejects.toThrow('No autorizado');
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it('promotes a user to admin', async () => {
    loginAs(admin);
    prismaMock.user.findUnique.mockResolvedValue({ id: 'user-2' } as any);

    await setUserRole('user-2', 'ADMIN');

    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: 'user-2' },
      data: { role: 'ADMIN' },
    });
  });

  it('does not let admins demote themselves', async () => {
    loginAs(admin);

    await expect(setUserRole('admin-1', 'REGULAR')).rejects.toThrow('a vos mismo');
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it('rejects unknown roles', async () => {
    loginAs(admin);

    await expect(setUserRole('user-2', 'ROOT' as any)).rejects.toThrow('Rol inválido');
  });
});
