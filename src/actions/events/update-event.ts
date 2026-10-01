'use server';

import prisma from '@/lib/prisma';
import { eventSchema, EventFormData } from '@/schemas/event-schema';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { buildEventAdmins } from './build-event-admins';
import { canCreateEvents, canEditEvent, canManageEventAdmins } from '@/lib/event-permissions';

export const updateEvent = async (id: string, data: EventFormData) => {
  const validatedData = eventSchema.parse(data);

  const sessionId = (await cookies()).get('sessionId')?.value;

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

  // Solo admins y ambassadors editan eventos
  if (!canCreateEvents(session.user)) {
    throw new Error('No tienes permisos para editar eventos');
  }

  // Verificar que el evento existe
  const existingEvent = await prisma.event.findUnique({
    where: { id },
    include: { admins: { select: { userId: true } } },
  });

  if (!existingEvent) {
    throw new Error('Evento no encontrado');
  }

  if (!canEditEvent(session.user, existingEvent)) {
    throw new Error('No tienes permisos para editar este evento');
  }

  // Convertir las fechas de string a Date
  const date = new Date(validatedData.date);
  const endDate = validatedData.endDate ? new Date(validatedData.endDate) : null;

  // Validar que endDate sea posterior a date si está presente
  if (endDate && endDate <= date) {
    throw new Error('La fecha de finalización debe ser posterior a la fecha de inicio');
  }

  const { sponsors, adminIds, ...eventData } = validatedData;
  // Los administradores solo los cambia quien creó el evento (o un admin)
  const managesAdmins = canManageEventAdmins(session.user, existingEvent);
  const admins = managesAdmins ? await buildEventAdmins(adminIds, existingEvent.createdById) : [];

  // Reemplazar sponsors (y administradores, si corresponde) existentes por los nuevos
  await prisma.$transaction([
    prisma.sponsor.deleteMany({
      where: { eventId: id },
    }),
    ...(managesAdmins ? [prisma.eventAdmin.deleteMany({ where: { eventId: id } })] : []),
    prisma.event.update({
      where: { id },
      data: {
        ...eventData,
        date: date,
        endDate: endDate,
        latitude: validatedData.latitude ?? null,
        longitude: validatedData.longitude ?? null,
        capacity: validatedData.capacity ?? null,
        ...(managesAdmins && { admins: { create: admins } }),
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
    }),
  ]);

  revalidatePath('/eventos');
  revalidatePath(`/eventos/${id}`);
  redirect(`/eventos/${id}`);
};
