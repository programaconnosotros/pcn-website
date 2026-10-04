import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { setIdentityLink } from '@/actions/identity-links/set-identity-link';
import { members } from '@/data/whatsapp-conversations/members';
import { HISTORIA_PEOPLE } from '@/components/historia/people';
import { actAs } from '@/test/db/fixtures';
import { expiredModel, quickUser, uid } from '@/test/db/actions-fixtures';

// Vínculos entre identidades externas (WhatsApp, GitHub, artículos, /historia) y usuarios,
// contra Postgres real.

const linkOf = (source: string, externalName: string) =>
  prisma.identityLink.findUnique({ where: { source_externalName: { source, externalName } } });

const asAdmin = async () => {
  const admin = await quickUser({ role: 'ADMIN' });
  await actAs(admin.id);
  return admin;
};

describe('setIdentityLink', () => {
  it('links a GitHub login to a user and relinks it to another one', async () => {
    await asAdmin();
    const first = await quickUser();
    const second = await quickUser();
    const login = `dev-${uid()}`;

    await expect(
      setIdentityLink({ source: 'github', externalName: login, userId: first.id }),
    ).resolves.toEqual({ success: true });
    expect((await linkOf('github', login))?.userId).toBe(first.id);
    expect(expiredModel('IdentityLink')).toBe(true);

    await setIdentityLink({ source: 'github', externalName: login, userId: second.id });

    expect((await linkOf('github', login))?.userId).toBe(second.id);
    expect(
      await prisma.identityLink.count({ where: { source: 'github', externalName: login } }),
    ).toBe(1);
    // Se revalidan los perfiles de ambos, el anterior y el nuevo
    expect(revalidatePath).toHaveBeenCalledWith(`/perfil/${first.id}`);
    expect(revalidatePath).toHaveBeenCalledWith(`/perfil/${second.id}`);
    expect(revalidatePath).toHaveBeenCalledWith('/desarrollo');
  });

  it('unlinks with a null user, and unlinking again is a no-op', async () => {
    await asAdmin();
    const user = await quickUser();
    const login = `dev-${uid()}`;
    await setIdentityLink({ source: 'github', externalName: login, userId: user.id });

    await setIdentityLink({ source: 'github', externalName: login, userId: null });
    expect(await linkOf('github', login)).toBeNull();

    await expect(
      setIdentityLink({ source: 'github', externalName: login, userId: null }),
    ).resolves.toEqual({ success: true });
  });

  it('links known WhatsApp members, article authors and /historia people', async () => {
    await asAdmin();
    const user = await quickUser();

    await setIdentityLink({ source: 'whatsapp', externalName: members[0].name, userId: user.id });
    await setIdentityLink({ source: 'articulos', externalName: 'Addy Osmani', userId: user.id });
    await setIdentityLink({
      source: 'historia',
      externalName: HISTORIA_PEOPLE[0],
      userId: user.id,
    });

    expect(
      (await prisma.identityLink.findMany({ where: { userId: user.id } }))
        .map((link) => link.source)
        .sort(),
    ).toEqual(['articulos', 'historia', 'whatsapp']);
  });

  it.each([
    ['an unknown WhatsApp member', { source: 'whatsapp', externalName: 'Nadie Conocido' }],
    ['an unknown article author', { source: 'articulos', externalName: 'Nadie Conocido' }],
    ['an invalid GitHub login', { source: 'github', externalName: '-no-valido-' }],
    ['an unknown source', { source: 'twitter', externalName: 'alguien' }],
  ])('rejects %s without writing', async (_case, input) => {
    await asAdmin();
    const user = await quickUser();

    await expect(
      setIdentityLink({ ...input, userId: user.id } as Parameters<typeof setIdentityLink>[0]),
    ).rejects.toThrow();
    expect(await prisma.identityLink.count({ where: { userId: user.id } })).toBe(0);
  });

  it('fails for a user that does not exist, keeping the previous link', async () => {
    await asAdmin();
    const user = await quickUser();
    const login = `dev-${uid()}`;
    await setIdentityLink({ source: 'github', externalName: login, userId: user.id });

    await expect(
      setIdentityLink({ source: 'github', externalName: login, userId: 'no-existe' }),
    ).rejects.toThrow('Usuario no encontrado');
    expect((await linkOf('github', login))?.userId).toBe(user.id);
  });

  it('forbids regular users, even linking themselves', async () => {
    const user = await quickUser();
    await actAs(user.id);
    const login = `dev-${uid()}`;

    await expect(
      setIdentityLink({ source: 'github', externalName: login, userId: user.id }),
    ).rejects.toThrow('No autorizado');
    expect(await linkOf('github', login)).toBeNull();
  });

  it('is removed in cascade when the linked user is deleted', async () => {
    await asAdmin();
    const user = await quickUser();
    const login = `dev-${uid()}`;
    await setIdentityLink({ source: 'github', externalName: login, userId: user.id });

    await prisma.user.delete({ where: { id: user.id } });

    expect(await linkOf('github', login)).toBeNull();
  });
});
