'use server';

import prisma from '@/lib/prisma';

export const fetchJobs = () => prisma.jobOffers.findMany();

// TODO: función para obtener un trabajo específico por ID
/* 
export async function getJobById(id: number): Promise<null> {
  return null;
}
 */
