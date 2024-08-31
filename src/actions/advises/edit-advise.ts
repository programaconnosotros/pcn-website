'use server';

import { adviseSchema } from '@/schemas/advise-schema';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export const editAdvise = async ({ id, content }: { id: string; content: string }) => {
  const validatedData = adviseSchema.parse({ content });

  const session = await auth();

  if (!session) throw new Error('No se ha iniciado sesión');
  if (!session.user?.id) throw new Error('No se ha encontrado el usuario');

  await prisma.advise.update({
    where: { id, authorId: session.user.id },
    data: { content: validatedData.content },
  });

  revalidatePath('/advises');
};
