'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireSessionUser } from './get-session-user';

const idsSchema = z.array(z.string().min(1)).max(1000);

/** Saves the order of the projects list, as dragged by an admin. `ids` is the full list, top first. */
export const reorderProjects = async (ids: string[]) => {
  const user = await requireSessionUser();
  if (user.role !== 'ADMIN') {
    throw new Error('Solo los admins pueden ordenar los proyectos');
  }

  const parsed = idsSchema.safeParse(ids);
  if (!parsed.success || new Set(parsed.data).size !== parsed.data.length) {
    throw new Error('Orden inválido');
  }

  const existing = await prisma.project.findMany({ select: { id: true } });
  const known = new Set(existing.map((project) => project.id));
  if (parsed.data.length !== known.size || parsed.data.some((id) => !known.has(id))) {
    // Someone added or removed a project since the list was loaded.
    throw new Error('La lista cambió, recargá la página e intentá de nuevo');
  }

  await prisma.$transaction(
    parsed.data.map((id, order) => prisma.project.update({ where: { id }, data: { order } })),
  );

  revalidatePath('/proyectos');

  return { success: true };
};
