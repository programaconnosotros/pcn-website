import { prismaMock } from '@/test/prisma';
import { mockCookies } from '@/test/cookies';
import { deleteUser } from './delete-user';

const admin = { id: 'admin-1', name: 'Admin', email: 'admin@pcn.com', role: 'ADMIN' as const };
const regular = { ...admin, id: 'user-1', role: 'REGULAR' as const };

const loginAs = (user: typeof admin | typeof regular) => {
  mockCookies({ sessionId: `session-${user.id}` });
  prismaMock.session.findUnique.mockResolvedValue({ id: 's', userId: user.id, user } as any);
};

describe('deleteUser', () => {
  it('only lets admins delete accounts', async () => {
    loginAs(regular);

    await expect(deleteUser('user-2')).rejects.toThrow('No autorizado');
    expect(prismaMock.user.delete).not.toHaveBeenCalled();
  });

  it('deletes the account with the consejos, comments and languages that do not cascade', async () => {
    loginAs(admin);
    prismaMock.user.findUnique.mockResolvedValue({ id: 'user-2', role: 'REGULAR' } as any);

    await expect(deleteUser('user-2')).resolves.toEqual({ success: true });

    expect(prismaMock.comment.deleteMany).toHaveBeenCalledWith({ where: { authorId: 'user-2' } });
    expect(prismaMock.advice.deleteMany).toHaveBeenCalledWith({ where: { authorId: 'user-2' } });
    expect(prismaMock.userLanguage.deleteMany).toHaveBeenCalledWith({
      where: { userId: 'user-2' },
    });
    expect(prismaMock.user.delete).toHaveBeenCalledWith({ where: { id: 'user-2' } });
  });

  it('does not let admins delete themselves or other admins', async () => {
    loginAs(admin);

    await expect(deleteUser('admin-1')).resolves.toEqual({
      success: false,
      error: 'No podés eliminar tu propia cuenta',
    });

    prismaMock.user.findUnique.mockResolvedValue({ id: 'admin-2', role: 'ADMIN' } as any);
    await expect(deleteUser('admin-2')).resolves.toEqual({
      success: false,
      error: 'Quitale el rol de admin antes de eliminarlo',
    });
    expect(prismaMock.user.delete).not.toHaveBeenCalled();
  });

  it('fails for a user that does not exist', async () => {
    loginAs(admin);
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(deleteUser('no-existe')).rejects.toThrow('Usuario no encontrado');
  });
});
