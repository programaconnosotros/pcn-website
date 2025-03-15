'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { ProfileFormData } from '@/schemas/profile-schema';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const updateProfile = async (data: ProfileFormData) => {
  const sessionId = cookies().get('sessionId')?.value;

  if (!sessionId) {
    console.error('Usuario no autenticado, redireccionando a /home');
    redirect('/');
  }

  const session = await prisma.session.findUnique({
    where: {
      id: sessionId,
    },
  });

  if (!session) {
    console.error('Usuario no autenticado, redireccionando a /home');
    redirect('/');
  }

  const { programmingLanguages, ...userData } = data;

  // Actualizamos primero los datos del usuario
  await prisma.user.update({
    where: { id: session.userId },
    data: userData,
  });

  // Eliminamos los lenguajes existentes
  await prisma.userLanguage.deleteMany({
    where: { userId: session.userId },
  });

  // Creamos los nuevos lenguajes
  if (programmingLanguages && programmingLanguages.length > 0) {
    await prisma.userLanguage.createMany({
      data: programmingLanguages.map((lang) => ({
        userId: session.userId,
        language: lang.languageId,
        proficiency: lang.experienceLevel,
      })),
    });
  }

  revalidatePath('/profile');
};
