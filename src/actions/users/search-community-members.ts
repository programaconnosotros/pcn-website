'use server';

import prisma from '@/lib/prisma';
import { requireSessionUser } from '@/actions/projects/get-session-user';

export type CommunityMemberOption = {
  id: string;
  name: string;
  image: string | null;
};

// Búsqueda de usuarios para cualquier miembro logueado. A diferencia de la búsqueda de
// admins, solo expone datos públicos y no permite buscar por email.
export async function searchCommunityMembers(q: string): Promise<CommunityMemberOption[]> {
  await requireSessionUser();
  const trimmed = q.trim();
  if (trimmed.length < 2) return [];

  return prisma.user.findMany({
    where: { name: { contains: trimmed, mode: 'insensitive' } },
    select: { id: true, name: true, image: true },
    orderBy: { name: 'asc' },
    take: 10,
  });
}
