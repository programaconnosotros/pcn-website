'use server';

import prisma from '@/lib/prisma';
import { getCurrentSession } from '@/actions/auth/get-current-session';
import { CONTENT_MARKS, type ContentMarkEntry, type ContentType } from './content-marks';

// The marks the logged-in user left on one kind of content. Anonymous visitors get none.
export const getContentMarks = async (
  contentType: ContentType,
): Promise<{ isAuthenticated: boolean; marks: ContentMarkEntry[] }> => {
  if (!Object.hasOwn(CONTENT_MARKS, contentType)) throw new Error('Tipo de contenido inválido');

  const session = await getCurrentSession();
  if (!session) return { isAuthenticated: false, marks: [] };

  const marks = await prisma.contentMark.findMany({
    where: { userId: session.userId, contentType },
    select: { contentId: true, mark: true },
    orderBy: { createdAt: 'desc' },
  });

  return { isAuthenticated: true, marks };
};
