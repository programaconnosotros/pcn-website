'use server';

import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function deleteAnnouncement(announcementId: string) {
  const sessionId = cookies().get('sessionId')?.value;

  if (!sessionId) {
    throw new Error('No autorizado');
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true },
  });

  if (!session || session.user.role !== 'ADMIN') {
    throw new Error('No tienes permisos para eliminar anuncios');
  }

  await prisma.announcement.delete({
    where: { id: announcementId },
  });

  revalidatePath('/anuncios');

  return { success: true };
}
