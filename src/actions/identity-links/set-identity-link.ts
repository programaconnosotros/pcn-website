'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin';
import { members } from '@/data/whatsapp-conversations/members';
import { IDENTITY_SOURCES } from '@/lib/identity-links';

const memberNames = new Set(members.map((member) => member.name));

const linkSchema = z
  .object({
    source: z.enum(IDENTITY_SOURCES),
    externalName: z.string().min(1).max(100),
    userId: z.string().min(1).nullable(),
  })
  .refine(
    ({ source, externalName }) =>
      source === 'whatsapp'
        ? memberNames.has(externalName)
        : /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i.test(externalName),
    { message: 'Nombre desconocido' },
  );

/**
 * Links a WhatsApp member or a GitHub login to a platform user, or unlinks it when `userId` is
 * null. Admins only.
 */
export const setIdentityLink = async (input: z.input<typeof linkSchema>) => {
  await requireAdmin();

  const parsed = linkSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.errors[0]?.message ?? 'Datos inválidos');
  }
  const { source, externalName, userId } = parsed.data;

  const previous = await prisma.identityLink.findUnique({
    where: { source_externalName: { source, externalName } },
    select: { userId: true },
  });

  if (userId) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
    if (!user) throw new Error('Usuario no encontrado');
    await prisma.identityLink.upsert({
      where: { source_externalName: { source, externalName } },
      create: { source, externalName, userId },
      update: { userId },
    });
  } else if (previous) {
    await prisma.identityLink.delete({
      where: { source_externalName: { source, externalName } },
    });
  }

  revalidatePath('/vinculos');
  revalidatePath(source === 'whatsapp' ? '/conversaciones' : '/desarrollo');
  for (const id of new Set([previous?.userId, userId])) {
    if (id) revalidatePath(`/perfil/${id}`);
  }

  return { success: true };
};
