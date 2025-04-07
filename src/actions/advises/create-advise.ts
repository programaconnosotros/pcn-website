'use server';

import { adviseSchema } from '@/schemas/advise-schema';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

export const createAdvise = async (content: string) => {
  const validatedData = adviseSchema.parse({ content });

  const sessionId = await cookies().get('sessionId');

  if (!sessionId) throw new Error('User not authenticated');

  const session = await prisma.session.findUnique({
    where: { id: sessionId.value },
  });

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

  revalidatePath('/advises');
  revalidatePath('/home');
};
