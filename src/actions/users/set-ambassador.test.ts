import { revalidatePath } from 'next/cache';
import { prismaMock } from '@/test/prisma';
import { mockCookies } from '@/test/cookies';
import { setAmbassador } from './set-ambassador';

const admin = { id: 'admin-1', name: 'Admin', email: 'admin@pcn.com', role: 'ADMIN' as const };
const regular = { ...admin, id: 'user-1', role: 'REGULAR' as const };

const loginAs = (user: typeof admin | typeof regular) => {
  mockCookies({ sessionId: `session-${user.id}` });
  prismaMock.session.findUnique.mockResolvedValue({ id: 's', userId: user.id, user } as any);
};

describe('setAmbassador', () => {
  it('only lets admins assign ambassadors', async () => {
    loginAs(regular);

    await expect(setAmbassador('user-2', true)).rejects.toThrow('No autorizado');
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it('rejects unknown users', async () => {
    loginAs(admin);
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(setAmbassador('ghost', true)).rejects.toThrow('Usuario no encontrado');
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it('marks a user as ambassador and refreshes their profile', async () => {
    loginAs(admin);
    prismaMock.user.findUnique.mockResolvedValue({ id: 'user-2' } as any);

    await setAmbassador('user-2', true);

    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: 'user-2' },
      data: { isAmbassador: true },
    });
    expect(revalidatePath).toHaveBeenCalledWith('/perfil/user-2');
  });

  it('removes a user from the program', async () => {
    loginAs(admin);
    prismaMock.user.findUnique.mockResolvedValue({ id: 'user-2' } as any);

    await setAmbassador('user-2', false);

    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: 'user-2' },
      data: { isAmbassador: false },
    });
  });
});
