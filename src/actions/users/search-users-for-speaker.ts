'use server';

import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { canManageSomeEvent } from '@/lib/event-access';
import { findSession } from '@/lib/session';
import { searchPeople } from '@/lib/people-search';

export type SpeakerUserOption = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  phoneNumber: string | null;
  jobTitle: string | null;
  enterprise: string | null;
  career: string | null;
  studyPlace: string | null;
};

async function requireAdmin() {
  const sessionId = (await cookies()).get('sessionId')?.value;
  if (!sessionId) throw new Error('No autorizado');
  const session = await findSession(sessionId);
  // Admins y quienes gestionan eventos (para cargar oradores en sus charlas)
  if (!session || !(await canManageSomeEvent(session.user))) throw new Error('No autorizado');
}

const MAX_RESULTS = 20;

const speakerSelect = {
  id: true,
  name: true,
  email: true,
  image: true,
  phoneNumber: true,
  jobTitle: true,
  enterprise: true,
  career: true,
  studyPlace: true,
} as const;

// Busca por cualquier parte del nombre, email, slogan, trabajo y estudio (ver searchPeople). Las
// cuentas suspendidas no se ofrecen como oradores.
export async function searchUsersForSpeaker(q: string, limit = 20): Promise<SpeakerUserOption[]> {
  await requireAdmin();
  // El límite llega del navegador: sin tope, `limit` enorme devolvería el email y el teléfono de
  // todos los usuarios a cualquier organizador.
  limit = Math.min(Math.max(Math.trunc(Number(limit)) || 1, 1), MAX_RESULTS);
  const trimmed = String(q ?? '').trim();
  if (!trimmed) {
    return prisma.user.findMany({
      where: { suspendedAt: null },
      select: speakerSelect,
      orderBy: { name: 'asc' },
      take: limit,
    });
  }

  const users = await prisma.user.findMany({
    where: { suspendedAt: null },
    select: {
      ...speakerSelect,
      slogan: true,
      positions: { select: { jobTitle: true, enterprise: true } },
    },
  });

  return searchPeople(users, trimmed, {
    name: (user) => user.name,
    fields: (user) => [
      user.name,
      user.email,
      user.slogan,
      user.jobTitle,
      user.enterprise,
      user.career,
      user.studyPlace,
      ...user.positions.flatMap((position) => [position.jobTitle, position.enterprise]),
    ],
    limit,
  }).map(({ slogan: _slogan, positions: _positions, ...option }) => option);
}

export async function getUserForSpeaker(id: string): Promise<SpeakerUserOption | null> {
  await requireAdmin();
  return prisma.user.findUnique({
    where: { id },
    select: speakerSelect,
  });
}
