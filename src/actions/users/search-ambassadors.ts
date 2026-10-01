'use server';

import prisma from '@/lib/prisma';
import { requireSessionUser } from '@/actions/projects/get-session-user';
import type { CommunityMemberOption } from './search-community-members';

// Busca ambassadors por nombre para asignarlos como administradores de un evento. Solo expone
// datos públicos.
export async function searchAmbassadors(q: string): Promise<CommunityMemberOption[]> {
  await requireSessionUser();
  const trimmed = q.trim();
  if (trimmed.length < 2) return [];

  return prisma.user.findMany({
    where: { isAmbassador: true, name: { contains: trimmed, mode: 'insensitive' } },
    select: { id: true, name: true, image: true },
    orderBy: { name: 'asc' },
    take: 10,
  });
}
