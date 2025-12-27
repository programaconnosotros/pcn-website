'use server';

import prisma from '@/lib/prisma';
import { testimonialSchema, TestimonialFormData } from '@/schemas/testimonial-schema';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { notifyAdmins } from '@/actions/notifications/notify-admins';

export const createTestimonial = async (data: TestimonialFormData) => {
  const validatedData = testimonialSchema.parse(data);

  const sessionId = cookies().get('sessionId')?.value;

  if (!sessionId) {
    throw new Error('Debes estar autenticado para crear un testimonio');
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true },
  });

  if (!session) {
    throw new Error('Sesión no encontrada');
  }

  const testimonial = await prisma.testimonial.create({
    data: {
      body: validatedData.body,
      userId: session.userId,
    },
  });

  // Obtener información del usuario para la notificación
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      name: true,
      email: true,
    },
  });

  // Notificar a los admins
  await notifyAdmins({
    type: 'testimonial_created',
    title: 'Nuevo testimonio creado',
    message: `${user?.name || 'Usuario'} ha creado un nuevo testimonio`,
    metadata: {
      testimonialId: testimonial.id,
      userId: session.userId,
      userName: user?.name || 'Usuario',
    },
  });

  revalidatePath('/testimonios');
};
