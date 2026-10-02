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
