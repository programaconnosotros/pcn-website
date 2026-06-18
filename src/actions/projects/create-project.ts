'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { projectSchema, ProjectFormData } from '@/schemas/project-schema';

export const createProject = async (data: ProjectFormData) => {
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

  const parsed = projectSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.errors[0]?.message ?? 'Datos inválidos');
  }

  const projectData = parsed.data;

  const project = await prisma.project.create({
    data: {
      title: projectData.title,
      description: projectData.description,
      url: projectData.url,
      logoUrl: projectData.logoUrl ?? '',
      techStack: projectData.techStack,
      order: projectData.order,
      members: {
        create: projectData.members.map((m, idx) => ({
          userId: m.userId ?? null,
          memberName: m.memberName,
          order: idx,
        })),
      },
    },
  });

  revalidatePath('/proyectos');

  return { success: true, projectId: project.id };
};
