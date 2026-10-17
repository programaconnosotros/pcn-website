'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin';

/** Promotes a user to admin or demotes them to regular. Admins only. */
export const setUserRole = async (userId: string, role: 'ADMIN' | 'REGULAR') => {
  const admin = await requireAdmin();

  if (role !== 'ADMIN' && role !== 'REGULAR') throw new Error('Rol inválido');
  // Evita que un admin se quede sin acceso por error. Se devuelve, no se lanza: en producción el
  // mensaje de un error lanzado no llega al navegador.
  if (admin.id === userId && role !== 'ADMIN') {
    return { success: false as const, error: 'No podés quitarte el rol de admin a vos mismo' };
  }

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!user) throw new Error('Usuario no encontrado');

  await prisma.user.update({ where: { id: userId }, data: { role } });

  revalidatePath('/usuarios');
  revalidatePath(`/perfil/${userId}`);

  return { success: true as const };
};
