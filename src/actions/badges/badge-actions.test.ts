import { prismaMock } from '@/test/prisma';
import { mockCookies } from '@/test/cookies';
import { awardBadge, createBadge, listBadges, revokeBadge } from './badge-actions';

const admin = { id: 'admin-1', name: 'Admin', email: 'admin@pcn.com', role: 'ADMIN' as const };
const regular = { ...admin, id: 'user-1', role: 'REGULAR' as const };

const loginAs = (user: typeof admin | typeof regular) => {
  mockCookies({ sessionId: `session-${user.id}` });
  prismaMock.session.findUnique.mockResolvedValue({ id: 's', userId: user.id, user } as any);
};

const validBadge = {
  name: 'Bug Hunter',
  description: 'Encontró y reportó bugs críticos.',
  icon: 'bug',
  tone: 'red',
};

describe('badges', () => {
  it('only lets admins create badges', async () => {
    loginAs(regular);

    await expect(createBadge(validBadge)).rejects.toThrow('No autorizado');
    expect(prismaMock.badge.create).not.toHaveBeenCalled();
  });

  it('rejects unknown icons and tones', async () => {
    loginAs(admin);

    await expect(createBadge({ ...validBadge, icon: 'skull' })).rejects.toThrow('Ícono inválido');
    await expect(createBadge({ ...validBadge, tone: 'pink' })).rejects.toThrow('Color inválido');
  });

  it('creates a badge and awards it in one go', async () => {
    loginAs(admin);
    prismaMock.badge.create.mockResolvedValue({ id: 'badge-1' } as any);
    prismaMock.user.findUnique.mockResolvedValue({ id: 'user-2' } as any);
    prismaMock.badge.findUnique.mockResolvedValue({ id: 'badge-1' } as any);

    await createBadge(validBadge, 'user-2');

    expect(prismaMock.badge.create).toHaveBeenCalledWith({ data: validBadge });
    expect(prismaMock.userBadge.upsert).toHaveBeenCalledWith({
      where: { userId_badgeId: { userId: 'user-2', badgeId: 'badge-1' } },
      create: { userId: 'user-2', badgeId: 'badge-1', awardedById: 'admin-1' },
      update: {},
    });
  });

  it('does not award badges to unknown users', async () => {
    loginAs(admin);
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.badge.findUnique.mockResolvedValue({ id: 'badge-1' } as any);

    await expect(awardBadge('ghost', 'badge-1')).rejects.toThrow('Usuario no encontrado');
    expect(prismaMock.userBadge.upsert).not.toHaveBeenCalled();
  });

  it('revokes a badge', async () => {
    loginAs(admin);

    await revokeBadge('user-2', 'badge-1');

    expect(prismaMock.userBadge.deleteMany).toHaveBeenCalledWith({
      where: { userId: 'user-2', badgeId: 'badge-1' },
    });
  });
});

describe('badge edge cases', () => {
  it('lists badges for admins only', async () => {
    loginAs(regular);
    await expect(listBadges()).rejects.toThrow('No autorizado');

    loginAs(admin);
    prismaMock.badge.findMany.mockResolvedValue([{ id: 'badge-1' }] as any);
    await expect(listBadges()).resolves.toEqual([{ id: 'badge-1' }]);
    expect(prismaMock.badge.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: [{ awards: { _count: 'desc' } }, { createdAt: 'asc' }] }),
    );
  });

  it('creates a badge without awarding it when no user is given', async () => {
    loginAs(admin);
    prismaMock.badge.create.mockResolvedValue({ id: 'badge-1' } as any);

    await expect(createBadge(validBadge)).resolves.toEqual({ id: 'badge-1' });
    expect(prismaMock.userBadge.upsert).not.toHaveBeenCalled();
  });

  it('rejects names and descriptions outside the length limits', async () => {
    loginAs(admin);

    await expect(createBadge({ ...validBadge, name: 'x' })).rejects.toThrow('muy corto');
    await expect(createBadge({ ...validBadge, name: 'x'.repeat(41) })).rejects.toThrow('Máximo 40');
    await expect(createBadge({ ...validBadge, description: 'abc' })).rejects.toThrow(
      'Contá por qué',
    );
    expect(prismaMock.badge.create).not.toHaveBeenCalled();
  });

  it('awards an existing badge and fails for an unknown one', async () => {
    loginAs(admin);
    prismaMock.user.findUnique.mockResolvedValue({ id: 'user-2' } as any);
    prismaMock.badge.findUnique.mockResolvedValue({ id: 'badge-1' } as any);

    await expect(awardBadge('user-2', 'badge-1')).resolves.toEqual({ success: true });

    prismaMock.badge.findUnique.mockResolvedValue(null);
    await expect(awardBadge('user-2', 'ghost')).rejects.toThrow('Badge no encontrado');
  });

  it('only lets admins award or revoke', async () => {
    loginAs(regular);

    await expect(awardBadge('user-2', 'badge-1')).rejects.toThrow('No autorizado');
    await expect(revokeBadge('user-2', 'badge-1')).rejects.toThrow('No autorizado');
    expect(prismaMock.userBadge.deleteMany).not.toHaveBeenCalled();
  });
});
