'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { canManageEventById, canManageSomeEvent } from '@/lib/event-access';

export const deleteRegistration = async (registrationId: string) => {
  // Verificar que el usuario está logueado
  const sessionId = (await cookies()).get('sessionId')?.value;
  if (!sessionId) {
    throw new Error('No autorizado');
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true },
  });

  if (!(await canManageSomeEvent(session?.user))) {
    throw new Error('No tienes permisos para realizar esta acción');
  }

  // Obtener la inscripción para saber el eventId
  const registration = await prisma.eventRegistration.findUnique({
    where: { id: registrationId },
  });

  if (!registration) {
    throw new Error('Inscripción no encontrada');
  }

  // Solo quien gestiona el evento elimina inscripciones
  if (!(await canManageEventById(session?.user, registration.eventId))) {
    throw new Error('No tienes permisos para realizar esta acción');
  }

  // Eliminar la inscripción físicamente
  await prisma.eventRegistration.delete({
    where: { id: registrationId },
  });

  revalidatePath(`/eventos/${registration.eventId}`);
  return { success: true };
};
