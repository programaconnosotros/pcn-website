'use server';

import prisma from '@/lib/prisma';
import { eventSchema, EventFormData } from '@/schemas/event-schema';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const updateEvent = async (id: string, data: EventFormData) => {
  const validatedData = eventSchema.parse(data);

  const sessionId = cookies().get('sessionId')?.value;

  if (!sessionId) {
    throw new Error('Usuario no autenticado');
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true },
  });

  if (!session) {
    throw new Error('Sesión no encontrada');
  }

  if (session.user.role !== 'ADMIN') {
    throw new Error('No tienes permisos para editar eventos');
  }

  // Verificar que el evento existe
  const existingEvent = await prisma.event.findUnique({
    where: { id },
  });

  if (!existingEvent) {
    throw new Error('Evento no encontrado');
  }

  // Convertir las fechas de string a Date
  const date = new Date(validatedData.date);
  const endDate = validatedData.endDate ? new Date(validatedData.endDate) : null;

  // Validar que endDate sea posterior a date si está presente
  if (endDate && endDate <= date) {
    throw new Error('La fecha de finalización debe ser posterior a la fecha de inicio');
  }

  const { sponsors, ...eventData } = validatedData;

  // Eliminar sponsors existentes y crear los nuevos
  await prisma.$transaction([
    prisma.sponsor.deleteMany({
      where: { eventId: id },
    }),
    prisma.event.update({
      where: { id },
      data: {
        ...eventData,
        date: date,
        endDate: endDate,
        latitude: validatedData.latitude ?? null,
        longitude: validatedData.longitude ?? null,
        sponsors: {
          create: sponsors?.filter((s) => s.name.trim() !== '').map((sponsor) => ({
            name: sponsor.name,
            website: sponsor.website && sponsor.website.trim() !== '' ? sponsor.website : null,
          })) || [],
        },
      },
    }),
  ]);

  revalidatePath('/eventos');
  revalidatePath(`/eventos/${id}`);
  redirect(`/eventos/${id}`);
};

