'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { notifyAdmins } from '@/actions/notifications/notify-admins';

export const deleteTestimonial = async (id: string) => {
  const sessionId = cookies().get('sessionId')?.value;
  if (!sessionId) {
    throw new Error('No autorizado');
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true },
  });

  if (!session) {
    throw new Error('No autorizado');
  }

  // Verificar que el testimonio existe y obtener información antes de eliminar
  const testimonial = await prisma.testimonial.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!testimonial) {
    throw new Error('Testimonio no encontrado');
  }

  // Solo el autor puede eliminar (o admin)
  if (testimonial.userId !== session.userId && session.user.role !== 'ADMIN') {
    throw new Error('No tienes permisos para eliminar este testimonio');
  }

  await prisma.testimonial.delete({
    where: { id },
  });

  // Notificar a los admins (solo si no es admin quien elimina)
  if (session.user.role !== 'ADMIN') {
    await notifyAdmins({
      type: 'testimonial_deleted',
      title: 'Testimonio eliminado',
      message: `${session.user.name} ha eliminado su testimonio`,
      metadata: {
        testimonialId: id,
        userId: session.userId,
        userName: session.user.name,
      },
    });
  }

  revalidatePath('/testimonios');
};
