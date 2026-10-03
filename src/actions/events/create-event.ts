'use server';

import prisma from '@/lib/prisma';
import { eventSchema, EventFormData } from '@/schemas/event-schema';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { canCreateEvents } from '@/lib/event-permissions';
import { enforceRateLimit } from '@/lib/rate-limit';
import { findSession } from '@/lib/session';

export const createEvent = async (data: EventFormData) => {
  await enforceRateLimit('createContent');

  const validatedData = eventSchema.parse(data);

  const sessionId = (await cookies()).get('sessionId')?.value;

  if (!sessionId) {
    throw new Error('Usuario no autenticado');
  }

  const session = await findSession(sessionId);

  if (!session) {
    throw new Error('Sesión no encontrada');
  }

  if (!canCreateEvents(session.user)) {
    throw new Error('No tienes permisos para crear eventos');
  }

  // Convertir las fechas de string a Date
  const date = new Date(validatedData.date);
  const endDate = validatedData.endDate ? new Date(validatedData.endDate) : null;

  // Validar que endDate sea posterior a date si está presente
  if (endDate && endDate <= date) {
    throw new Error('La fecha de finalización debe ser posterior a la fecha de inicio');
  }

  const { sponsors, ...eventData } = validatedData;

  const event = await prisma.event.create({
    data: {
      ...eventData,
      date: date,
      endDate: endDate,
      googleMapsUrl: validatedData.googleMapsUrl ?? null,
      capacity: validatedData.capacity ?? null,
      createdById: session.user.id,
      // Quien crea el evento queda como organizador; el resto se suma desde su página.
      organizers: { create: { userId: session.user.id } },
      sponsors: {
        create:
          sponsors
            ?.filter((s) => s.name.trim() !== '')
            .map((sponsor) => ({
              name: sponsor.name,
              website: sponsor.website && sponsor.website.trim() !== '' ? sponsor.website : null,
            })) || [],
      },
    },
  });

  revalidatePath('/eventos');
  redirect(`/eventos/${event.id}`);
};
