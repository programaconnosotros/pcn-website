'use server';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { ProfileFormData, profileSchema } from '@/schemas/profile-schema';

export const updateProfile = async (data: ProfileFormData) => {
  const session = await auth();

  if (!session) throw new Error('No session found');
  if (!session.user?.id) throw new Error('No user found');

  const validatedData = profileSchema.parse(data);

  await prisma.user.update({
    where: { id: session.user.id },
    data: validatedData,
  });

  revalidatePath('/profile');
};
