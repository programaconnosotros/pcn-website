'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { isProjectCollaborator, requireSessionUser } from './get-session-user';

// Un colaborador se quita a sí mismo del equipo de un proyecto.
export const leaveProject = async (id: string) => {
  const user = await requireSessionUser();

  const project = await prisma.project.findUnique({
    where: { id },
    include: { members: { select: { userId: true } } },
  });
  if (!project) {
    throw new Error('Proyecto no encontrado');
  }

  if (!isProjectCollaborator(user, project)) {
    throw new Error('No formás parte del equipo de este proyecto');
  }

  await prisma.projectMember.deleteMany({ where: { projectId: id, userId: user.id } });

  revalidatePath('/proyectos');

  return { success: true };
};
