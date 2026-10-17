'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin';

const userIdSchema = z.string().min(1).max(100);

/**
 * Deletes an account for good, with everything that cascades from it (sessions, likes, projects,
 * registrations...). Admins only. Its consejos, comments and languages don't cascade in the
 * schema, so they're deleted first, in the same transaction.
 */
export const deleteUser = async (userId: string) => {
  const admin = await requireAdmin();
  const id = userIdSchema.parse(userId);

  // Returned, not thrown: in production a thrown message doesn't reach the browser.
  if (admin.id === id) {
    return { success: false as const, error: 'No podés eliminar tu propia cuenta' };
  }

  const user = await prisma.user.findUnique({ where: { id }, select: { id: true, role: true } });
  if (!user) throw new Error('Usuario no encontrado');
  if (user.role === 'ADMIN') {
    return { success: false as const, error: 'Quitale el rol de admin antes de eliminarlo' };
  }

  await prisma.$transaction([
    prisma.comment.deleteMany({ where: { authorId: id } }),
    prisma.advice.deleteMany({ where: { authorId: id } }),
    prisma.userLanguage.deleteMany({ where: { userId: id } }),
    prisma.user.delete({ where: { id } }),
  ]);

  revalidatePath('/usuarios');
  revalidatePath('/consejos');
  revalidatePath(`/perfil/${id}`);

  return { success: true as const };
};
