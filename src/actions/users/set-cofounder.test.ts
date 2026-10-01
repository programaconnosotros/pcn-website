import { revalidatePath } from 'next/cache';
import { prismaMock } from '@/test/prisma';
import { mockCookies } from '@/test/cookies';
import { setCofounder } from './set-cofounder';

const admin = { id: 'admin-1', name: 'Admin', email: 'admin@pcn.com', role: 'ADMIN' as const };
const regular = { ...admin, id: 'user-1', role: 'REGULAR' as const };

const loginAs = (user: typeof admin | typeof regular) => {
  mockCookies({ sessionId: `session-${user.id}` });
  prismaMock.session.findUnique.mockResolvedValue({ id: 's', userId: user.id, user } as any);
};

describe('setCofounder', () => {
  it('only lets admins mark co-founders', async () => {
    loginAs(regular);

    await expect(setCofounder('user-2', true)).rejects.toThrow('No autorizado');
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it('rejects unknown users', async () => {
    loginAs(admin);
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(setCofounder('ghost', true)).rejects.toThrow('Usuario no encontrado');
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it('marks a user as co-founder and refreshes their profile', async () => {
    loginAs(admin);
    prismaMock.user.findUnique.mockResolvedValue({ id: 'user-2' } as any);

    await setCofounder('user-2', true);

    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: 'user-2' },
      data: { isCofounder: true },
    });
    expect(revalidatePath).toHaveBeenCalledWith('/perfil/user-2');
  });

  it('unmarks a co-founder', async () => {
    loginAs(admin);
    prismaMock.user.findUnique.mockResolvedValue({ id: 'user-2' } as any);

    await setCofounder('user-2', false);

    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: 'user-2' },
      data: { isCofounder: false },
    });
  });
});
