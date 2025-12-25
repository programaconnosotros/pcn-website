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

  await prisma.event.update({
    where: { id },
    data: {
      name: validatedData.name,
      description: validatedData.description,
      date: date,
      endDate: endDate,
      city: validatedData.city,
      address: validatedData.address,
      placeName: validatedData.placeName,
      flyerSrc: validatedData.flyerSrc,
      latitude: validatedData.latitude ?? null,
      longitude: validatedData.longitude ?? null,
    },
  });

  revalidatePath('/eventos');
  revalidatePath(`/eventos/${id}`);
  redirect(`/eventos/${id}`);
};

