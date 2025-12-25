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

  // Verificar si ya está registrado (por email)
  const existingRegistration = await prisma.eventRegistration.findUnique({
    where: {
      eventId_email: {
        eventId: eventId,
        email: validatedData.email,
      },
    },
  });

  if (existingRegistration) {
    throw new Error('Ya estás registrado en este evento con este correo electrónico');
  }

  // Validar cupo disponible (verificar nuevamente antes de crear la inscripción)
  if (event.capacity !== null) {
    const currentRegistrations = await prisma.eventRegistration.count({
      where: {
        eventId: eventId,
      },
    });

    if (currentRegistrations >= event.capacity) {
      throw new Error('El cupo del evento está completo. No se pueden aceptar más inscripciones.');
    }
  }

  // Crear la inscripción
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

  revalidatePath(`/eventos/${eventId}`);
  redirect(`/eventos/${eventId}`);
};


