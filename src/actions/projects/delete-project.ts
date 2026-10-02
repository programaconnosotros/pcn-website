'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { canManageProject, requireSessionUser } from './get-session-user';

export const deleteProject = async (id: string) => {
  const user = await requireSessionUser();

  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) {
    throw new Error('Proyecto no encontrado');
  }

  if (!canManageProject(user, project)) {
    throw new Error('No tenés permisos para realizar esta acción');
  }

  await prisma.project.delete({ where: { id } });

  revalidatePath('/proyectos');

  return { success: true };
};
