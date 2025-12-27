'use server';

import prisma from '@/lib/prisma';
import { testimonialSchema, TestimonialFormData } from '@/schemas/testimonial-schema';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { notifyAdmins } from '@/actions/notifications/notify-admins';

export const updateTestimonial = async (id: string, data: TestimonialFormData) => {
  const validatedData = testimonialSchema.parse(data);

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

  // Verificar que el testimonio existe y pertenece al usuario
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

  // Solo el autor puede editar (o admin)
  if (testimonial.userId !== session.userId && session.user.role !== 'ADMIN') {
    throw new Error('No tienes permisos para editar este testimonio');
  }

  await prisma.testimonial.update({
    where: { id },
    data: {
      body: validatedData.body,
    },
  });

  // Notificar a los admins (solo si no es admin quien edita)
  if (session.user.role !== 'ADMIN') {
    await notifyAdmins({
      type: 'testimonial_updated',
      title: 'Testimonio actualizado',
      message: `${session.user.name} ha actualizado su testimonio`,
      metadata: {
        testimonialId: id,
        userId: session.userId,
        userName: session.user.name,
      },
    });
  }

  revalidatePath('/testimonios');
};
