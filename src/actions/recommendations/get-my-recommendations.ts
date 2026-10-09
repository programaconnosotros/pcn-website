'use server';

import prisma from '@/lib/prisma';
import { getCurrentSession } from '@/actions/auth/get-current-session';
import { recommendationKindSchema } from '@/schemas/recommendation-schema';

const LIMIT = 20;

export type MyRecommendation = {
  id: string;
  title: string;
  status: 'PENDING' | 'REJECTED';
  createdAt: Date;
};

/**
 * Lo que el usuario recomendó de un tipo y todavía no está en la lista: lo pendiente de revisión y
 * lo rechazado. Sin sesión, nada (y el botón lleva al login).
 */
export async function getMyRecommendations(kind: unknown): Promise<{
  isAuthenticated: boolean;
  isAdmin: boolean;
  items: MyRecommendation[];
}> {
  const parsedKind = recommendationKindSchema.safeParse(kind);
  if (!parsedKind.success) throw new Error('Tipo de recomendación inválido');

  const session = await getCurrentSession();
  if (!session) return { isAuthenticated: false, isAdmin: false, items: [] };

  const items = await prisma.recommendation.findMany({
    where: {
      submittedById: session.user.id,
      kind: parsedKind.data,
      status: { in: ['PENDING', 'REJECTED'] },
    },
    orderBy: { createdAt: 'desc' },
    take: LIMIT,
    select: { id: true, title: true, status: true, createdAt: true },
  });

  return {
    isAuthenticated: true,
    isAdmin: session.user.role === 'ADMIN',
    items: items as MyRecommendation[],
  };
}
