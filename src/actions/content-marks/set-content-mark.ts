'use server';

import prisma from '@/lib/prisma';
import { getCurrentSession } from '@/actions/auth/get-current-session';
import { isValidContentMark, type ContentType } from './content-marks';

// Turns one of the logged-in user's marks on or off. Idempotent, so retries are harmless.
export const setContentMark = async (
  contentType: ContentType,
  contentId: string,
  mark: string,
  value: boolean,
) => {
  if (!isValidContentMark(contentType, mark)) throw new Error('Marca inválida');
  if (!contentId || contentId.length > 100) throw new Error('Contenido inválido');

  const session = await getCurrentSession();
  if (!session) throw new Error('Debes estar autenticado');

  const key = { userId: session.userId, contentType, contentId, mark };

  if (value) {
    await prisma.contentMark.upsert({
      where: { userId_contentType_contentId_mark: key },
      create: key,
      update: {},
    });
  } else {
    await prisma.contentMark.deleteMany({ where: key });
  }

  return { success: true };
};
