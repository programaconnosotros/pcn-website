import prisma from '@/lib/prisma';
import { awardBadge, createBadge, listBadges, revokeBadge } from '@/actions/badges/badge-actions';
import { actAs } from '@/test/db/fixtures';
import { expiredModel, quickUser, uid } from '@/test/db/actions-fixtures';

// Badges personalizados contra Postgres real: solo admins los crean, entregan y quitan.

const badgeInput = (overrides: Record<string, string> = {}) => ({
  name: `Badge ${uid()}`,
  description: 'Por ayudar a la comunidad',
  icon: 'trophy',
  tone: 'gold',
  ...overrides,
});

const asAdmin = async () => {
  const admin = await quickUser({ role: 'ADMIN' });
  await actAs(admin.id);
  return admin;
};

describe('createBadge', () => {
  it('stores a trimmed badge', async () => {
    await asAdmin();

    const badge = await createBadge(badgeInput({ name: '  Mentora  ' }));

    expect(await prisma.badge.findUniqueOrThrow({ where: { id: badge.id } })).toMatchObject({
      name: 'Mentora',
      description: 'Por ayudar a la comunidad',
      icon: 'trophy',
      tone: 'gold',
    });
    expect(expiredModel('Badge')).toBe(true);
  });

  it('awards it right away when a user is given, crediting the admin', async () => {
    const admin = await asAdmin();
    const user = await quickUser();

    const badge = await createBadge(badgeInput(), user.id);

    const awards = await prisma.userBadge.findMany({ where: { badgeId: badge.id } });
    expect(awards).toHaveLength(1);
    expect(awards[0]).toMatchObject({ userId: user.id, awardedById: admin.id });
  });

  it.each([
    ['an unknown icon', { icon: 'skull' }],
    ['an unknown tone', { tone: 'rainbow' }],
    ['a one-letter name', { name: 'X' }],
    ['a short description', { description: 'hey' }],
  ])('rejects %s without creating it', async (_case, override) => {
    await asAdmin();
    const input = badgeInput(override);

    await expect(createBadge(input)).rejects.toThrow();
    expect(await prisma.badge.count({ where: { name: input.name.trim() } })).toBe(0);
  });

  // BUG: isBadgeIcon/isBadgeTone (src/lib/badges.ts:93-94) usan `value in BADGE_ICONS`, que
  // también es true para las claves del prototipo de Object. Un badge con ícono `constructor` o
  // `toString` se guarda, y al dibujarlo BADGE_ICONS[icon] es una función de Object, no un ícono.
  it.failing.each([['constructor'], ['toString'], ['__proto__']])(
    'rejects the Object prototype key %s as an icon',
    async (icon) => {
      await asAdmin();
      const input = badgeInput({ icon });

      await expect(createBadge(input)).rejects.toThrow('Ícono inválido');
      expect(await prisma.badge.count({ where: { name: input.name } })).toBe(0);
    },
  );

  // BUG: createBadge (src/actions/badges/badge-actions.ts:47-48) crea el badge y después lo
  // entrega fuera de una transacción. Si el usuario no existe, el admin ve el error pero el badge
  // ya quedó creado (y un reintento crea otro igual).
  it.failing('creates nothing when the user to award it to does not exist', async () => {
    await asAdmin();
    const input = badgeInput();

    await expect(createBadge(input, 'no-existe')).rejects.toThrow('Usuario no encontrado');
    expect(await prisma.badge.count({ where: { name: input.name } })).toBe(0);
  });

  it('forbids regular users and anonymous visitors', async () => {
    const user = await quickUser();
    const input = badgeInput();

    await actAs(user.id);
    await expect(createBadge(input, user.id)).rejects.toThrow('No autorizado');
    await actAs();
    await expect(createBadge(input)).rejects.toThrow('No autorizado');
    expect(await prisma.badge.count({ where: { name: input.name } })).toBe(0);
  });
});

describe('awardBadge and revokeBadge', () => {
  it('awards a badge once even if awarded twice, and revokes it', async () => {
    const admin = await asAdmin();
    const user = await quickUser();
    const badge = await prisma.badge.create({ data: badgeInput() });

    await expect(awardBadge(user.id, badge.id)).resolves.toEqual({ success: true });
    await awardBadge(user.id, badge.id);
    const awards = await prisma.userBadge.findMany({ where: { badgeId: badge.id } });
    expect(awards).toHaveLength(1);
    expect(awards[0]).toMatchObject({ userId: user.id, awardedById: admin.id });

    await expect(revokeBadge(user.id, badge.id)).resolves.toEqual({ success: true });
    expect(await prisma.userBadge.count({ where: { badgeId: badge.id } })).toBe(0);
    // El badge sigue existiendo para entregarlo a otros
    expect(await prisma.badge.findUnique({ where: { id: badge.id } })).not.toBeNull();
  });

  it('revoking a badge the user does not have is a no-op', async () => {
    await asAdmin();
    const user = await quickUser();
    const other = await quickUser();
    const badge = await prisma.badge.create({ data: badgeInput() });
    await prisma.userBadge.create({ data: { userId: other.id, badgeId: badge.id } });

    await revokeBadge(user.id, badge.id);

    expect(await prisma.userBadge.count({ where: { badgeId: badge.id } })).toBe(1);
  });

  it('fails for an unknown user or badge without writing', async () => {
    await asAdmin();
    const user = await quickUser();
    const badge = await prisma.badge.create({ data: badgeInput() });

    await expect(awardBadge('no-existe', badge.id)).rejects.toThrow('Usuario no encontrado');
    await expect(awardBadge(user.id, 'no-existe')).rejects.toThrow('Badge no encontrado');
    expect(await prisma.userBadge.count({ where: { userId: user.id } })).toBe(0);
  });

  it('forbids regular users from awarding or revoking', async () => {
    const user = await quickUser();
    const badge = await prisma.badge.create({ data: badgeInput() });
    await prisma.userBadge.create({ data: { userId: user.id, badgeId: badge.id } });
    await actAs(user.id);

    await expect(awardBadge(user.id, badge.id)).rejects.toThrow('No autorizado');
    await expect(revokeBadge(user.id, badge.id)).rejects.toThrow('No autorizado');
    expect(await prisma.userBadge.count({ where: { badgeId: badge.id } })).toBe(1);
  });

  it('keeps the award but forgets the awarder when the admin is deleted', async () => {
    const admin = await asAdmin();
    const user = await quickUser();
    const badge = await prisma.badge.create({ data: badgeInput() });
    await awardBadge(user.id, badge.id);

    await prisma.session.deleteMany({ where: { userId: admin.id } });
    await prisma.user.delete({ where: { id: admin.id } });

    const [award] = await prisma.userBadge.findMany({ where: { badgeId: badge.id } });
    expect(award).toMatchObject({ userId: user.id, awardedById: null });
  });
});

describe('listBadges', () => {
  it('lists badges most awarded first, with their award count', async () => {
    await asAdmin();
    const users = await Promise.all(Array.from({ length: 40 }, () => quickUser()));
    const popular = await prisma.badge.create({ data: badgeInput() });
    const lessPopular = await prisma.badge.create({ data: badgeInput() });
    await prisma.userBadge.createMany({
      data: users.map((user) => ({ userId: user.id, badgeId: popular.id })),
    });
    await prisma.userBadge.createMany({
      data: users.slice(0, 39).map((user) => ({ userId: user.id, badgeId: lessPopular.id })),
    });

    const badges = await listBadges();

    expect(badges.slice(0, 2).map((badge) => [badge.id, badge._count.awards])).toEqual([
      [popular.id, 40],
      [lessPopular.id, 39],
    ]);
  });

  it('forbids regular users', async () => {
    await actAs((await quickUser()).id);
    await expect(listBadges()).rejects.toThrow('No autorizado');
  });
});
