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
    include: { user: true },
  });

  if (!session) throw new Error('Session not found');

  // Verificar que el consejo existe
  const advise = await prisma.advise.findUnique({
    where: { id },
  });

  if (!advise) throw new Error('Consejo no encontrado');

  // Solo el autor puede editar (o admin)
  if (advise.authorId !== session.userId && session.user.role !== 'ADMIN') {
    throw new Error('No tienes permisos para editar este consejo');
  }

  await prisma.advise.update({
    where: { id },
    data: { content: validatedData.content },
  });

  revalidatePath('/consejos');
};
