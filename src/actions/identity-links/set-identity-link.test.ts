import { prismaMock } from '@/test/prisma';
import { mockCookies } from '@/test/cookies';
import { setIdentityLink } from './set-identity-link';

const admin = { id: 'admin-1', name: 'Admin', email: 'admin@pcn.com', role: 'ADMIN' as const };
const regular = { ...admin, id: 'user-1', role: 'REGULAR' as const };

const loginAs = (user: typeof admin | typeof regular) => {
  mockCookies({ sessionId: `session-${user.id}` });
  prismaMock.session.findUnique.mockResolvedValue({ id: 's', userId: user.id, user } as any);
};

describe('setIdentityLink', () => {
  it('only lets admins link identities', async () => {
    loginAs(regular);

    await expect(
      setIdentityLink({ source: 'github', externalName: 'octocat', userId: 'user-2' }),
    ).rejects.toThrow('No autorizado');
    expect(prismaMock.identityLink.upsert).not.toHaveBeenCalled();
  });

  it('links a GitHub login to a user', async () => {
    loginAs(admin);
    prismaMock.identityLink.findUnique.mockResolvedValue(null);
    prismaMock.user.findUnique.mockResolvedValue({ id: 'user-2' } as any);

    await setIdentityLink({ source: 'github', externalName: 'octocat', userId: 'user-2' });

    expect(prismaMock.identityLink.upsert).toHaveBeenCalledWith({
      where: { source_externalName: { source: 'github', externalName: 'octocat' } },
      create: { source: 'github', externalName: 'octocat', userId: 'user-2' },
      update: { userId: 'user-2' },
    });
  });

  it('links an article author to a user', async () => {
    loginAs(admin);
    prismaMock.identityLink.findUnique.mockResolvedValue(null);
    prismaMock.user.findUnique.mockResolvedValue({ id: 'user-2' } as any);

    await setIdentityLink({
      source: 'articulos',
      externalName: 'Santiago Villada',
      userId: 'user-2',
    });

    expect(prismaMock.identityLink.upsert).toHaveBeenCalledWith({
      where: { source_externalName: { source: 'articulos', externalName: 'Santiago Villada' } },
      create: { source: 'articulos', externalName: 'Santiago Villada', userId: 'user-2' },
      update: { userId: 'user-2' },
    });
  });

  it('rejects names that did not write any article', async () => {
    loginAs(admin);

    await expect(
      setIdentityLink({ source: 'articulos', externalName: 'Alguien Inventado', userId: 'user-2' }),
    ).rejects.toThrow('Nombre desconocido');
  });

  it('links a person mentioned in /historia to a user', async () => {
    loginAs(admin);
    prismaMock.identityLink.findUnique.mockResolvedValue(null);
    prismaMock.user.findUnique.mockResolvedValue({ id: 'user-2' } as any);

    await setIdentityLink({ source: 'historia', externalName: 'Germán Navarro', userId: 'user-2' });

    expect(prismaMock.identityLink.upsert).toHaveBeenCalledWith({
      where: { source_externalName: { source: 'historia', externalName: 'Germán Navarro' } },
      create: { source: 'historia', externalName: 'Germán Navarro', userId: 'user-2' },
      update: { userId: 'user-2' },
    });
  });

  it('rejects names /historia does not mention', async () => {
    loginAs(admin);

    await expect(
      setIdentityLink({ source: 'historia', externalName: 'Alguien Inventado', userId: 'user-2' }),
    ).rejects.toThrow('Nombre desconocido');
  });

  it('rejects WhatsApp names that are not community members', async () => {
    loginAs(admin);

    await expect(
      setIdentityLink({ source: 'whatsapp', externalName: 'Alguien Inventado', userId: 'user-2' }),
    ).rejects.toThrow('Nombre desconocido');
  });

  it('rejects invalid GitHub logins', async () => {
    loginAs(admin);

    await expect(
      setIdentityLink({ source: 'github', externalName: 'no/válido', userId: 'user-2' }),
    ).rejects.toThrow('Nombre desconocido');
  });

  it('unlinks when no user is given', async () => {
    loginAs(admin);
    prismaMock.identityLink.findUnique.mockResolvedValue({ userId: 'user-2' } as any);

    await setIdentityLink({ source: 'whatsapp', externalName: 'Agustín Sánchez', userId: null });

    expect(prismaMock.identityLink.delete).toHaveBeenCalledWith({
      where: { source_externalName: { source: 'whatsapp', externalName: 'Agustín Sánchez' } },
    });
  });
});

describe('setIdentityLink edge cases', () => {
  it('does not link to unknown users', async () => {
    loginAs(admin);
    prismaMock.identityLink.findUnique.mockResolvedValue(null);
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(
      setIdentityLink({ source: 'github', externalName: 'octocat', userId: 'ghost' }),
    ).rejects.toThrow('Usuario no encontrado');
    expect(prismaMock.identityLink.upsert).not.toHaveBeenCalled();
  });

  it('does nothing when unlinking a name that was never linked', async () => {
    loginAs(admin);
    prismaMock.identityLink.findUnique.mockResolvedValue(null);

    await setIdentityLink({ source: 'github', externalName: 'octocat', userId: null });

    expect(prismaMock.identityLink.delete).not.toHaveBeenCalled();
    expect(prismaMock.identityLink.upsert).not.toHaveBeenCalled();
  });
});
