'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin';

/** Adds a user to the PCN Ambassadors program or removes them from it. Admins only. */
export const setAmbassador = async (userId: string, isAmbassador: boolean) => {
  await requireAdmin();

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!user) throw new Error('Usuario no encontrado');

  await prisma.user.update({ where: { id: userId }, data: { isAmbassador } });

  revalidatePath('/usuarios');
  revalidatePath(`/perfil/${userId}`);
  revalidatePath('/');

  return { success: true };
};
