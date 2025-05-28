'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

export const deleteAdvise = async (id: string) => {
  const sessionId = await cookies().get('sessionId');

  if (!sessionId) throw new Error('User not authenticated');

  const session = await prisma.session.findUnique({
    where: { id: sessionId.value },
  });

  if (!session) throw new Error('Session not found');

  await prisma.advise.delete({
    where: { id, authorId: session.userId },
  });

  revalidatePath('/consejos');
  revalidatePath('/');
};
