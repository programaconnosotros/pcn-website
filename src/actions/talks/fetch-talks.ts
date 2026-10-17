'use server';

import prisma from '@/lib/prisma';
import { requireEventManager } from '@/lib/event-access';

/** Charlas de un evento con los datos de contacto de sus oradores. Solo quien gestiona el evento. */
export const fetchTalks = async (eventId: string) => {
  await requireEventManager(eventId);

  return prisma.talk.findMany({
    where: { eventId },
    include: { speakers: { orderBy: { order: 'asc' }, omit: { speakerPhone: false } } },
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
  });
};

/**
 * Una charla para editarla, con los datos de contacto de sus oradores. Solo quien gestiona su
 * evento (las charlas sin evento, solo admins). El form de edición reescribe los oradores, así
 * que necesita los teléfonos: el listado público de /charlas no los trae.
 */
export const fetchTalkForEdit = async (id: string) => {
  const talk = await prisma.talk.findUnique({
    where: { id },
    include: { speakers: { orderBy: { order: 'asc' }, omit: { speakerPhone: false } } },
  });
  if (!talk) throw new Error('Charla no encontrada');

  await requireEventManager(talk.eventId);
  return talk;
};
