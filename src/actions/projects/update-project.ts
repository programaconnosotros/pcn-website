'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { projectSchema, ProjectFormData } from '@/schemas/project-schema';
import { canEditProject, canManageProject, requireSessionUser } from './get-session-user';
import { buildProjectMembers } from './build-project-members';
import { enforceRateLimit } from '@/lib/rate-limit';

export const updateProject = async (id: string, data: ProjectFormData) => {
  await enforceRateLimit('editContent');

  const user = await requireSessionUser();

  const parsed = projectSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.errors[0]?.message ?? 'Datos inválidos');
  }

  const projectData = parsed.data;

  const existing = await prisma.project.findUnique({
    where: { id },
    include: { members: { select: { userId: true } } },
  });
  if (!existing) {
    throw new Error('Proyecto no encontrado');
  }

  if (!canEditProject(user, existing)) {
    throw new Error('No tenés permisos para realizar esta acción');
  }

  // Información básica: la puede editar el autor o cualquier colaborador.
  const basicInfo = {
    title: projectData.title,
    description: projectData.description,
    url: projectData.url,
    logoUrl: projectData.logoUrl ?? existing.logoUrl,
    techStack: projectData.techStack,
    isOpenSource: projectData.isOpenSource,
    // Solo un proyecto open-source guarda el link al repo.
    repoUrl: projectData.isOpenSource ? projectData.repoUrl ?? null : null,
    startYear: projectData.startYear,
    endYear: projectData.endYear,
  };

  // Un colaborador no toca el equipo ni los roles: se ignoran aunque los mande.
  if (!canManageProject(user, existing)) {
    await prisma.project.update({ where: { id }, data: basicInfo });
    revalidatePath('/proyectos');
    return { success: true };
  }

  await prisma.$transaction([
    prisma.project.update({
      where: { id },
      data: { ...basicInfo, authorRole: projectData.authorRole },
    }),
    prisma.projectMember.deleteMany({ where: { projectId: id } }),
    prisma.projectMember.createMany({
      data: buildProjectMembers(projectData.members, existing.authorId).map((member) => ({
        ...member,
        projectId: id,
      })),
    }),
  ]);

  revalidatePath('/proyectos');

  return { success: true };
};
