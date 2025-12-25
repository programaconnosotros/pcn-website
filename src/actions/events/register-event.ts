'use server';

import prisma from '@/lib/prisma';
import { eventRegistrationSchema, EventRegistrationFormData } from '@/schemas/event-registration-schema';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { notifyAdmins } from '@/actions/notifications/notify-admins';

export const registerEvent = async (eventId: string, data: EventRegistrationFormData) => {
  const validatedData = eventRegistrationSchema.parse(data);

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

  // Obtener userId si el usuario está logueado
  const sessionId = cookies().get('sessionId')?.value;
  let userId: string | undefined = undefined;
  let userName: string | undefined = undefined;

  if (sessionId) {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { user: true },
    });
    if (session) {
      userId = session.userId;
      userName = session.user.name;
    }
  }

  // Verificar si ya existe una inscripción (activa o cancelada)
  const existingRegistration = await prisma.eventRegistration.findFirst({
    where: {
      eventId: eventId,
      email: validatedData.email,
    },
  });

  // Si existe una inscripción activa, no permitir
  if (existingRegistration && existingRegistration.cancelledAt === null) {
    throw new Error('Ya estás registrado en este evento con este correo electrónico');
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
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
          type: validatedData.type,
          workTitle: validatedData.workTitle || null,
          workPlace: validatedData.workPlace || null,
          studyField: validatedData.studyField || null,
          studyPlace: validatedData.studyPlace || null,
          userId: userId || null,
          cancelledAt: null, // Reactivar la inscripción
        },
      });
      registrationId = existingRegistration.id;
    } else {
      // Crear nueva inscripción
      const newRegistration = await prisma.eventRegistration.create({
        data: {
          eventId: eventId,
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
          email: validatedData.email,
          type: validatedData.type,
          workTitle: validatedData.workTitle || null,
          workPlace: validatedData.workPlace || null,
          studyField: validatedData.studyField || null,
          studyPlace: validatedData.studyPlace || null,
          userId: userId || null,
        },
      });
      registrationId = newRegistration.id;
    }

    // Notificar a los admins sobre la nueva inscripción
    await notifyAdmins({
      type: 'event_registration_created',
      title: 'Nueva inscripción a evento',
      message: `${userName || `${validatedData.firstName} ${validatedData.lastName}`} se ha inscrito al evento "${event.name}"`,
      metadata: {
        eventId: eventId,
        eventName: event.name,
        registrationId: registrationId,
        userName: userName || `${validatedData.firstName} ${validatedData.lastName}`,
        userEmail: validatedData.email,
      },
    });
  } catch (error: any) {
    // Manejar error de constraint único de Prisma (caso de condición de carrera)
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      // Verificar nuevamente si existe una inscripción activa
      const duplicateCheck = await prisma.eventRegistration.findFirst({
        where: {
          eventId: eventId,
          email: validatedData.email,
          cancelledAt: null,
        },
      });

      if (duplicateCheck) {
        throw new Error('Ya estás registrado en este evento con este correo electrónico');
      }
      // Si no hay inscripción activa, podría ser un error de timing, reintentar
      throw new Error('Ocurrió un error al procesar la inscripción. Por favor, intenta nuevamente.');
    }
    throw error;
  }

  revalidatePath(`/eventos/${eventId}`);
  redirect(`/eventos/${eventId}`);
};


