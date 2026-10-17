'use server';

import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { findSession } from '@/lib/session';

export const markErrorAsResolved = async (errorId: string) => {
  const sessionId = (await cookies()).get('sessionId')?.value;
  if (!sessionId) {
    throw new Error('No autorizado');
  }

  const session = await findSession(sessionId);

  if (!session || session.user.role !== 'ADMIN') {
    throw new Error('Solo los administradores pueden marcar errores como resueltos');
  }

  await prisma.errorLog.update({
    where: { id: errorId },
    data: {
      resolved: true,
      resolvedAt: new Date(),
      resolvedBy: session.userId,
    },
  });

  revalidatePath('/errores');
};
