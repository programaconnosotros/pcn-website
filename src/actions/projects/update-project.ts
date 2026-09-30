'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { projectSchema, ProjectFormData } from '@/schemas/project-schema';
import { canManageProject, requireSessionUser } from './get-session-user';
import { buildProjectMembers } from './build-project-members';

export const updateProject = async (id: string, data: ProjectFormData) => {
  const user = await requireSessionUser();

  const parsed = projectSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.errors[0]?.message ?? 'Datos inválidos');
  }

  const projectData = parsed.data;

  const existing = await prisma.project.findUnique({ where: { id } });
  if (!existing) {
    throw new Error('Proyecto no encontrado');
  }

  if (!canManageProject(user, existing)) {
    throw new Error('No tenés permisos para realizar esta acción');
  }

  await prisma.$transaction([
    prisma.project.update({
      where: { id },
      data: {
        title: projectData.title,
        description: projectData.description,
        url: projectData.url,
        logoUrl: projectData.logoUrl ?? existing.logoUrl,
        techStack: projectData.techStack,
      },
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
