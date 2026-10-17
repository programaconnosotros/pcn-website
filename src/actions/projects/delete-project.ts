'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { deleteObjectsOrLog } from '@/lib/s3';
import { canManageProject, requireSessionUser } from './get-session-user';

export const deleteProject = async (id: string) => {
  const user = await requireSessionUser();

  const project = await prisma.project.findUnique({
    where: { id },
    include: { media: { select: { storageKeys: true } } },
  });
  if (!project) {
    throw new Error('Proyecto no encontrado');
  }

  if (!canManageProject(user, project)) {
    throw new Error('No tenés permisos para realizar esta acción');
  }

  await prisma.project.delete({ where: { id } });
  // Las fotos y videos se borran en cascada; sus archivos en S3, a mano.
  await deleteObjectsOrLog(project.media.flatMap((media) => media.storageKeys));

  revalidatePath('/proyectos');
  revalidatePath(`/proyectos/${id}`);

  return { success: true };
};
