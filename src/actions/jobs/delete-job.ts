'use server';

import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function deleteJob(jobId: string) {
  const sessionId = cookies().get('sessionId')?.value;

  if (!sessionId) {
    throw new Error('No autorizado');
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true },
  });

  if (!session || session.user.role !== 'ADMIN') {
    throw new Error('No tienes permisos para eliminar ofertas de trabajo');
  }

  const existingJob = await prisma.jobOffers.findUnique({
    where: { id: jobId },
  });

  if (!existingJob) {
    throw new Error('Oferta de trabajo no encontrada');
  }

  await prisma.jobOffers.delete({
    where: { id: jobId },
  });

  revalidatePath('/trabajos');

  return { success: true };
}

