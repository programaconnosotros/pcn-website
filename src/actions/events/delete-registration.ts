'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

export const deleteRegistration = async (registrationId: string) => {
  // Verificar que el usuario es admin
  const sessionId = cookies().get('sessionId')?.value;
  if (!sessionId) {
    throw new Error('No autorizado');
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true },
  });

  if (!session?.user || session.user.role !== 'ADMIN') {
    throw new Error('No tienes permisos para realizar esta acción');
  }

  // Obtener la inscripción para saber el eventId
  const registration = await prisma.eventRegistration.findUnique({
    where: { id: registrationId },
  });

  if (!registration) {
    throw new Error('Inscripción no encontrada');
  }

  // Eliminar la inscripción físicamente
  await prisma.eventRegistration.delete({
    where: { id: registrationId },
  });

  revalidatePath(`/eventos/${registration.eventId}`);
  return { success: true };
};
