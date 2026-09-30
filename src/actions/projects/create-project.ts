'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { projectSchema, ProjectFormData } from '@/schemas/project-schema';
import { requireSessionUser } from './get-session-user';
import { buildProjectMembers } from './build-project-members';

export const createProject = async (data: ProjectFormData) => {
  const user = await requireSessionUser();

  const parsed = projectSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.errors[0]?.message ?? 'Datos inválidos');
  }

  const projectData = parsed.data;

  // Los proyectos nuevos van al final; solo un admin los reordena desde la lista.
  const last = await prisma.project.aggregate({ _max: { order: true } });

  const project = await prisma.project.create({
    data: {
      title: projectData.title,
      description: projectData.description,
      url: projectData.url,
      logoUrl: projectData.logoUrl ?? '',
      techStack: projectData.techStack,
      order: (last._max.order ?? -1) + 1,
      // El autor es siempre quien carga el proyecto, nunca un valor enviado por el cliente.
      authorId: user.id,
      members: {
        create: buildProjectMembers(projectData.members, user.id),
      },
    },
  });

  revalidatePath('/proyectos');

  return { success: true, projectId: project.id };
};
