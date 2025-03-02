'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { ProfileFormData, profileSchema } from '@/schemas/profile-schema';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const updateProfile = async (data: ProfileFormData) => {
  const sessionId = cookies().get('sessionId')?.value;

  if (!sessionId) {
    console.error('Usuario no autenticado, redireccionando a /home');
    redirect('/home');
  }

  const session = await prisma.session.findUnique({
    where: {
      id: sessionId,
    },
  });

  if (!session) {
    console.error('Usuario no autenticado, redireccionando a /home');
    redirect('/home');
  }

  const validatedData = profileSchema.parse(data);

  await prisma.user.update({
    where: { id: session.userId },
    data: validatedData,
  });

  revalidatePath('/profile');
};
