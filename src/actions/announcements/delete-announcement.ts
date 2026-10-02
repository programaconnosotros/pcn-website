'use server';

import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { findSession } from '@/lib/session';

export async function deleteAnnouncement(announcementId: string) {
  const sessionId = (await cookies()).get('sessionId')?.value;

  if (!sessionId) {
    throw new Error('No autorizado');
  }

  const session = await findSession(sessionId);

  if (!session || session.user.role !== 'ADMIN') {
    throw new Error('No tienes permisos para eliminar anuncios');
  }

  await prisma.announcement.delete({
    where: { id: announcementId },
  });

  revalidatePath('/anuncios');

  return { success: true };
}
