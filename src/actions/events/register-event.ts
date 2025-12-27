'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { notifyAdmins } from '@/actions/notifications/notify-admins';

export const registerEvent = async (eventId: string, options?: { skipRedirect?: boolean }) => {
  // Verificar que el evento existe y no está eliminado
  const event = await prisma.event.findFirst({
    where: {
      id: eventId,
      deletedAt: null,
    },
  });

  if (!event) {
    throw new Error('Evento no encontrado');
  }

  // Requerir autenticación - solo usuarios autenticados pueden inscribirse
  const sessionId = cookies().get('sessionId')?.value;
  if (!sessionId) {
    throw new Error('Debes estar autenticado para inscribirte a un evento');
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true },
  });

  if (!session) {
    throw new Error('Sesión no válida. Por favor, inicia sesión nuevamente');
  }

  const userId = session.userId;
  const userName = session.user.name;
  const userEmail = session.user.email;

  // Verificar si ya existe una inscripción (activa o cancelada)
  const existingRegistration = await prisma.eventRegistration.findFirst({
    where: {
      eventId: eventId,
      userId: userId,
    },
  });

  // Si existe una inscripción activa, no permitir
  if (existingRegistration && existingRegistration.cancelledAt === null) {
    throw new Error('Ya estás registrado en este evento');
  }

  // Validar cupo disponible (verificar nuevamente antes de crear/actualizar la inscripción)
  if (event.capacity !== null) {
    const currentRegistrations = await prisma.eventRegistration.count({
      where: {
        eventId: eventId,
        cancelledAt: null, // Excluir inscripciones canceladas
      },
    });

    if (currentRegistrations >= event.capacity) {
      throw new Error('El cupo del evento está completo. No se pueden aceptar más inscripciones.');
    }
  }

  let registrationId: string;
  try {
    // Si existe una inscripción cancelada, reactivarla
    if (existingRegistration && existingRegistration.cancelledAt !== null) {
      await prisma.eventRegistration.update({
        where: { id: existingRegistration.id },
        data: {
          cancelledAt: null, // Reactivar la inscripción
        },
      });
      registrationId = existingRegistration.id;
    } else {
      // Crear nueva inscripción
      const newRegistration = await prisma.eventRegistration.create({
        data: {
          eventId: eventId,
          userId: userId,
        },
      });
      registrationId = newRegistration.id;
    }

    // Notificar a los admins sobre la nueva inscripción
    await notifyAdmins({
      type: 'event_registration_created',
      title: 'Nueva inscripción a evento',
      message: `${userName} se ha inscrito al evento "${event.name}"`,
      metadata: {
        eventId: eventId,
        eventName: event.name,
        registrationId: registrationId,
        userName: userName,
        userEmail: userEmail,
      },
    });
  } catch (error: any) {
    // Manejar error de constraint único de Prisma (caso de condición de carrera)
    if (error.code === 'P2002' && error.meta?.target?.includes('userId')) {
      // Verificar nuevamente si existe una inscripción activa
      const duplicateCheck = await prisma.eventRegistration.findFirst({
        where: {
          eventId: eventId,
          userId: userId,
          cancelledAt: null,
        },
      });

      if (duplicateCheck) {
        throw new Error('Ya estás registrado en este evento');
      }
      // Si no hay inscripción activa, podría ser un error de timing, reintentar
      throw new Error(
        'Ocurrió un error al procesar la inscripción. Por favor, intenta nuevamente.',
      );
    }
    throw error;
  }

  revalidatePath(`/eventos/${eventId}`);

  // Si skipRedirect es true, no redirigir (útil para inscripción automática desde el botón)
  if (options?.skipRedirect) {
    return { success: true, registrationId };
  }

  redirect(`/eventos/${eventId}?registered=true`);
};
