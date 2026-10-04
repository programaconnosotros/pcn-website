'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin';
import { isBadgeIcon, isBadgeTone } from '@/lib/badges';

const badgeSchema = z.object({
  name: z.string().trim().min(2, 'El nombre es muy corto').max(40, 'Máximo 40 caracteres'),
  description: z
    .string()
    .trim()
    .min(5, 'Contá por qué se lo ganan')
    .max(200, 'Máximo 200 caracteres'),
  icon: z.string().refine(isBadgeIcon, 'Ícono inválido'),
  tone: z.string().refine(isBadgeTone, 'Color inválido'),
});

export type BadgeInput = z.input<typeof badgeSchema>;

/** Every custom badge, most awarded first. Admins only. */
export async function listBadges() {
  await requireAdmin();
  return prisma.badge.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      icon: true,
      tone: true,
      _count: { select: { awards: true } },
    },
    orderBy: [{ awards: { _count: 'desc' } }, { createdAt: 'asc' }],
  });
}

/** Creates a custom badge and, if `userId` is given, awards it right away. Admins only. */
export async function createBadge(input: BadgeInput, userId?: string) {
  const admin = await requireAdmin();
  const parsed = badgeSchema.safeParse(input);
  if (!parsed.success) throw new Error(parsed.error.errors[0]?.message ?? 'Datos inválidos');

  // El usuario se valida antes de crear nada: si no existe, no queda una insignia huérfana que un
  // reintento duplicaría.
  if (userId && !(await prisma.user.findUnique({ where: { id: userId }, select: { id: true } }))) {
    throw new Error('Usuario no encontrado');
  }

  const badge = await prisma.badge.create({ data: parsed.data });
  if (userId) await award(userId, badge.id, admin.id);
  return badge;
}

/** Awards a badge to a user. Admins only. */
export async function awardBadge(userId: string, badgeId: string) {
  const admin = await requireAdmin();
  await award(userId, badgeId, admin.id);
  return { success: true };
}

/** Takes a badge back from a user. Admins only. */
export async function revokeBadge(userId: string, badgeId: string) {
  await requireAdmin();
  await prisma.userBadge.deleteMany({ where: { userId, badgeId } });
  revalidatePath(`/perfil/${userId}`);
  return { success: true };
}

async function award(userId: string, badgeId: string, awardedById: string) {
  const [user, badge] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { id: true } }),
    prisma.badge.findUnique({ where: { id: badgeId }, select: { id: true } }),
  ]);
  if (!user) throw new Error('Usuario no encontrado');
  if (!badge) throw new Error('Badge no encontrado');

  await prisma.userBadge.upsert({
    where: { userId_badgeId: { userId, badgeId } },
    create: { userId, badgeId, awardedById },
    update: {},
  });
  revalidatePath(`/perfil/${userId}`);
}
