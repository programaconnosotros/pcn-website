'use server';

import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { announcementSchema, AnnouncementFormData } from '@/schemas/announcement-schema';
import { findSession } from '@/lib/session';

export async function createAnnouncement(data: AnnouncementFormData) {
  const sessionId = (await cookies()).get('sessionId')?.value;

  if (!sessionId) {
    throw new Error('No autorizado');
  }

  const session = await findSession(sessionId);

  if (!session || session.user.role !== 'ADMIN') {
    throw new Error('No tienes permisos para crear anuncios');
  }

  const validatedData = announcementSchema.parse(data);

  const announcement = await prisma.announcement.create({
    data: {
      title: validatedData.title,
      content: validatedData.content,
      category: validatedData.category,
      pinned: validatedData.pinned,
      published: validatedData.published,
      authorId: session.user.id,
      eventId: validatedData.category === 'evento' ? validatedData.eventId : null,
    },
  });

  revalidatePath('/anuncios');
  if (validatedData.eventId) {
    revalidatePath(`/eventos/${validatedData.eventId}`);
  }

  return announcement;
}
