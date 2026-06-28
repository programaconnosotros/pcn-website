'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

export const deleteProject = async (id: string) => {
  const sessionId = (await cookies()).get('sessionId')?.value;
  if (!sessionId) {
    throw new Error('Debes estar autenticado');
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true },
  });

  if (!session || session.user.role !== 'ADMIN') {
    throw new Error('No tenés permisos para realizar esta acción');
  }

  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) {
    throw new Error('Proyecto no encontrado');
  }

  await prisma.project.delete({ where: { id } });

  revalidatePath('/proyectos');

  return { success: true };
};
