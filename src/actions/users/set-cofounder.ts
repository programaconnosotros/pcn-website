'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin';

/** Marks a user as a PCN co-founder, or unmarks them. Admins only. */
export const setCofounder = async (userId: string, isCofounder: boolean) => {
  await requireAdmin();

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!user) throw new Error('Usuario no encontrado');

  await prisma.user.update({ where: { id: userId }, data: { isCofounder } });

  revalidatePath('/usuarios');
  revalidatePath(`/perfil/${userId}`);

  return { success: true };
};
