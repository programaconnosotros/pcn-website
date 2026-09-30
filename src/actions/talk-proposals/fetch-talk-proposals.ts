'use server';

import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin';

export const fetchTalkProposals = async (eventId: string) => {
  await requireAdmin();

  return prisma.talkProposal.findMany({
    where: { eventId },
    orderBy: { createdAt: 'desc' },
    include: {
      talk: { select: { id: true } },
      speakers: { orderBy: { order: 'asc' } },
    },
  });
};
