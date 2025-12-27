'use server';

import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { announcementSchema, AnnouncementFormData } from '@/schemas/announcement-schema';

export async function updateAnnouncement(announcementId: string, data: AnnouncementFormData) {
  const sessionId = cookies().get('sessionId')?.value;

  if (!sessionId) {
    throw new Error('No autorizado');
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true },
  });

  if (!session || session.user.role !== 'ADMIN') {
    throw new Error('No tienes permisos para editar anuncios');
  }

  const validatedData = announcementSchema.parse(data);

  const announcement = await prisma.announcement.update({
    where: { id: announcementId },
    data: {
      title: validatedData.title,
      content: validatedData.content,
      category: validatedData.category,
      pinned: validatedData.pinned,
      published: validatedData.published,
    },
  });

  revalidatePath('/anuncios');

  return announcement;
}

