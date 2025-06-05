'use server';

import prisma from '@/lib/prisma';
import { adviseSchema } from '@/schemas/advise-schema';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

export const editAdvise = async ({ id, content }: { id: string; content: string }) => {
  const validatedData = adviseSchema.parse({ content });

  const sessionId = await cookies().get('sessionId');

  if (!sessionId) throw new Error('User not authenticated');

  const session = await prisma.session.findUnique({
    where: { id: sessionId.value },
  });

  if (!session) throw new Error('Session not found');

  await prisma.advise.update({
    where: { id, authorId: session.userId },
    data: { content: validatedData.content },
  });

  revalidatePath('/consejos');
};
