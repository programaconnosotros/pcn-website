'use server';

import prisma from '@/lib/prisma';
import { requireEventManager } from '@/lib/event-access';

export const fetchTalkProposals = async (eventId: string) => {
  await requireEventManager(eventId);

  return prisma.talkProposal.findMany({
    where: { eventId },
    orderBy: { createdAt: 'desc' },
    include: {
      talk: { select: { id: true } },
      speakers: { orderBy: { order: 'asc' }, omit: { speakerPhone: false } },
    },
  });
};
