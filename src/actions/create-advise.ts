'use server';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export const createAdvise = async (content: string) => {
  const session = await auth();

  if (!session) throw new Error('User not authenticated');
  if (!session.user?.id) throw new Error('User id not found in session');

  await prisma.advise.create({
    data: {
      content,
      author: { connect: { id: session.user.id } },
    },
  });

  revalidatePath('/home');
};
