'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

export const toggleFeatured = async (id: string) => {
  const sessionId = cookies().get('sessionId')?.value;
  if (!sessionId) {
    throw new Error('No autorizado');
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true },
  });

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
  revalidatePath('/home');
};
