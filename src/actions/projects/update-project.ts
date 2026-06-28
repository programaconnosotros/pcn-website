'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { projectSchema, ProjectFormData } from '@/schemas/project-schema';

export const updateProject = async (id: string, data: ProjectFormData) => {
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

  const existing = await prisma.project.findUnique({ where: { id } });
  if (!existing) {
    throw new Error('Proyecto no encontrado');
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
        order: projectData.order,
      },
    }),
    prisma.projectMember.deleteMany({ where: { projectId: id } }),
    prisma.projectMember.createMany({
      data: projectData.members.map((m, idx) => ({
        projectId: id,
        userId: m.userId ?? null,
        memberName: m.memberName,
        order: idx,
      })),
    }),
  ]);

  revalidatePath('/proyectos');

  return { success: true };
};
