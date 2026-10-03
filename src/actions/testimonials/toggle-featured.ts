'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { findSession } from '@/lib/session';

export const toggleFeatured = async (id: string) => {
  const sessionId = (await cookies()).get('sessionId')?.value;
  if (!sessionId) {
    throw new Error('No autorizado');
  }

  const session = await findSession(sessionId);

  if (!session || session.user.role !== 'ADMIN') {
    throw new Error('Solo los administradores pueden marcar testimonios como destacados');
  }

  const testimonial = await prisma.testimonial.findUnique({
    where: { id },
  });

  if (!testimonial) {
    throw new Error('Testimonio no encontrado');
  }

  await prisma.testimonial.update({
    where: { id },
    data: {
      featured: !testimonial.featured,
    },
  });

  revalidatePath('/testimonios');
  revalidatePath('/');
};
