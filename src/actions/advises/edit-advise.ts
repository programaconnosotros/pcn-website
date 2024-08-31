'use server';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export const editAdvise = async ({ id, content }: { id: string; content: string }) => {
  const session = await auth();

  if (!session) throw new Error('No se ha iniciado sesión');
  if (!session.user?.id) throw new Error('No se ha encontrado el usuario');

  await prisma.advise.update({
    where: { id, authorId: session.user.id },
    data: { content },
  });

  revalidatePath('/advises');
};
