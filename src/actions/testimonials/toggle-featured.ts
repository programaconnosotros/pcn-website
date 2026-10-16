'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { findSession } from '@/lib/session';
import { notifyUsers } from '@/actions/notifications/notify-users';

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

  if (!testimonial.featured) {
    await notifyUsers(
      [testimonial.userId],
      {
        type: 'testimonial_featured',
        title: 'Destacamos tu testimonio',
        message:
          'Tu testimonio ahora aparece entre los destacados de la home. ¡Gracias por compartirlo!',
        href: `/testimonios/${id}`,
        metadata: { testimonialId: id },
      },
      session.userId,
    );
  }

  revalidatePath('/testimonios');
  revalidatePath('/');
};
