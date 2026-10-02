'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { canManageEventById, canManageSomeEvent } from '@/lib/event-access';
import { findSession } from '@/lib/session';
import { lockEvent, notifyPromotions, promoteFromWaitlist } from '@/lib/event-waitlist';

export const deleteRegistration = async (registrationId: string) => {
  // Verificar que el usuario está logueado
  const sessionId = (await cookies()).get('sessionId')?.value;
  if (!sessionId) {
    throw new Error('No autorizado');
  }

  const session = await findSession(sessionId);

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

  const outcome = await prisma.$transaction(async (tx) => {
    // Bloquear el evento: la baja y la promoción de quien espera pasan juntas
    const event = await lockEvent(tx, registration.eventId);

    // Eliminar la inscripción físicamente
    await tx.eventRegistration.delete({
      where: { id: registrationId },
    });

    // Si se liberó un lugar, pasa a la próxima persona en la lista de espera
    if (!event || registration.cancelledAt !== null) return null;
    return { event, promoted: await promoteFromWaitlist(tx, event) };
  });

  if (outcome && outcome.promoted.length > 0) {
    await notifyPromotions(outcome.event, outcome.promoted);
  }

  revalidatePath(`/eventos/${registration.eventId}`);
  return { success: true };
};
