'use server';

import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { jobSchema, JobFormData } from '@/schemas/job-schema';

export async function updateJob(jobId: string, data: JobFormData) {
  const sessionId = cookies().get('sessionId')?.value;

  if (!sessionId) {
    throw new Error('No autorizado');
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true },
  });

  if (!session || session.user.role !== 'ADMIN') {
    throw new Error('No tienes permisos para editar ofertas de trabajo');
  }

  const existingJob = await prisma.jobOffers.findUnique({
    where: { id: jobId },
  });

  if (!existingJob) {
    throw new Error('Oferta de trabajo no encontrada');
  }

  const validatedData = jobSchema.parse(data);

  const job = await prisma.jobOffers.update({
    where: { id: jobId },
    data: {
      title: validatedData.title,
      description: validatedData.description,
      enterprise: validatedData.enterprise,
      location: validatedData.location,
      type: validatedData.type,
      tags: validatedData.tags,
      available: validatedData.available,
    },
  });

  revalidatePath('/trabajos');

  return { success: true, jobId: job.id };
}

