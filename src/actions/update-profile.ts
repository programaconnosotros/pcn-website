'use server';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export const updateProfile = async (data: { name: string; email: string }) => {
  const session = await auth();

  if (!session) throw new Error('No session found');
  if (!session.user?.id) throw new Error('No user found');

  await prisma.user.update({
    where: { id: session.user.id },
    data,
  });

  revalidatePath('/profile');
};
