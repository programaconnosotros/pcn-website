'use server';

import prisma from '@/lib/prisma';
import { adviseSchema } from '@/schemas/advise-schema';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { enforceRateLimit } from '@/lib/rate-limit';
import { findSession } from '@/lib/session';

export const createAdvise = async (content: string) => {
  await enforceRateLimit('createContent');

  const validatedData = adviseSchema.parse({ content });

  const sessionId = (await cookies()).get('sessionId');

  if (!sessionId) throw new Error('User not authenticated');

  const session = await findSession(sessionId.value);

  if (!session) throw new Error('Session not found');

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });

  if (!user) throw new Error('User not found');

  await prisma.advise.create({
    data: {
      content: validatedData.content,
      author: { connect: { id: user.id } },
    },
  });

  revalidatePath('/consejos');
  revalidatePath('/');
};
