'use server';

import prisma from '@/lib/prisma';
import { eventRegistrationSchema, EventRegistrationFormData } from '@/schemas/event-registration-schema';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

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

  if (sessionId) {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });
    if (session) {
      userId = session.userId;
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
  } else {
    // Crear nueva inscripción
    await prisma.eventRegistration.create({
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
  }

  revalidatePath(`/eventos/${eventId}`);
  redirect(`/eventos/${eventId}`);
};


