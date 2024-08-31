'use server';

import { adviseSchema } from '@/schemas/advise-schema';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export const createAdvise = async (content: string) => {
  const validatedData = adviseSchema.parse({ content });

  const session = await auth();

  if (!session) throw new Error('User not authenticated');
  if (!session.user?.id) throw new Error('User id not found in session');

  await prisma.advise.create({
    data: {
      content: validatedData.content,
      author: { connect: { id: session.user.id } },
    },
  });

  revalidatePath('/home');
};
