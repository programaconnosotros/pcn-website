'use server';

import prisma from '@/lib/prisma';

export const fetchTalkProposals = async (eventId: string) => {
  return prisma.talkProposal.findMany({
    where: { eventId },
    orderBy: { createdAt: 'desc' },
    include: { talk: { select: { id: true } } },
  });
};
