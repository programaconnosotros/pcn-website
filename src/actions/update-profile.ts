'use server';

import prisma from '@/lib/prisma';
import { profileSchema, type ProfileInput } from '@/schemas/profile-schema';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { enforceRateLimit } from '@/lib/rate-limit';
import { findSession } from '@/lib/session';

export const updateProfile = async (data: ProfileInput) => {
  await enforceRateLimit('editContent');

  const sessionId = (await cookies()).get('sessionId')?.value;

  if (!sessionId) {
    console.error('Usuario no autenticado, redireccionando a /home');
    redirect('/');
  }

  const session = await findSession(sessionId);

  if (!session) {
    console.error('Usuario no autenticado, redireccionando a /home');
    redirect('/');
  }

  // Lo que llega es lo que mande el navegador, no lo que muestra el form: sin validar, alguien
  // podría agregar `role: 'ADMIN'`, `emailVerified` o `password` y Prisma los guardaría. El schema
  // descarta todo campo que no sea del perfil.
  const parsed = profileSchema.safeParse(data);
  if (!parsed.success) throw new Error(parsed.error.errors[0]?.message ?? 'Datos inválidos');

  // El email no se cambia desde acá: quedaría marcado como verificado sin que nadie haya probado
  // que es suyo, y bloquearía a su verdadero dueño.
  const { programmingLanguages, positions: rawPositions, email: _email, ...userData } = parsed.data;
  const positions = rawPositions
    .filter((position) => position.jobTitle)
    .map((position) => ({ jobTitle: position.jobTitle, enterprise: position.enterprise || null }));

  // Actualizamos primero los datos del usuario. jobTitle/enterprise espejan el primer puesto
  // para las vistas que muestran uno solo.
  await prisma.user.update({
    where: { id: session.userId },
    data: {
      ...userData,
      jobTitle: positions[0]?.jobTitle ?? null,
      enterprise: positions[0]?.enterprise ?? null,
    },
  });

  // Reemplazamos los puestos actuales
  await prisma.userPosition.deleteMany({
    where: { userId: session.userId },
  });

  if (positions.length > 0) {
    await prisma.userPosition.createMany({
      data: positions.map((position, order) => ({ userId: session.userId, ...position, order })),
    });
  }

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
        color: lang.color,
        logo: lang.logo,
      })),
    });
  }

  revalidatePath('/perfil');
};
