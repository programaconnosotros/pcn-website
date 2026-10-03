'use server';

import prisma from '@/lib/prisma';
import { requireSessionUser } from '@/actions/projects/get-session-user';
import { searchPeople } from '@/lib/people-search';

export type CommunityMemberOption = {
  id: string;
  name: string;
  image: string | null;
};

// Búsqueda de usuarios para cualquier miembro logueado. Solo devuelve datos públicos; busca por
// cualquier parte del nombre, slogan, trabajo y estudio. El email solo cuenta cuando busca un
// admin, para no dejar averiguar a quién pertenece una dirección.
export async function searchCommunityMembers(q: string): Promise<CommunityMemberOption[]> {
  const user = await requireSessionUser();
  const trimmed = q.trim();
  if (trimmed.length < 2) return [];
  const isAdmin = user.role === 'ADMIN';

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      image: true,
      email: isAdmin,
      slogan: true,
      jobTitle: true,
      enterprise: true,
      career: true,
      studyPlace: true,
      positions: { select: { jobTitle: true, enterprise: true } },
    },
  });

  return searchPeople(users, trimmed, {
    name: (person) => person.name,
    fields: (person) => [
      person.name,
      isAdmin ? person.email : null,
      person.slogan,
      person.jobTitle,
      person.enterprise,
      person.career,
      person.studyPlace,
      ...person.positions.flatMap((position) => [position.jobTitle, position.enterprise]),
    ],
    limit: 10,
  }).map(({ id, name, image }) => ({ id, name, image }));
}
