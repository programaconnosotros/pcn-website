'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getCurrentSession } from '@/actions/auth/get-current-session';
import prisma from '@/lib/prisma';
import { notifyEveryone } from '@/actions/notifications/notify-users';
import { enforceRateLimit } from '@/lib/rate-limit';
import { jobOfferSchema, type JobOfferInput } from '@/schemas/job-offer-schema';

const idSchema = z.string().min(1).max(64);

const requireUser = async () => {
  const session = await getCurrentSession();
  if (!session) throw new Error('Debes estar autenticado');
  return session.user;
};

const parse = (input: JobOfferInput) => {
  const parsed = jobOfferSchema.safeParse(input);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? 'Datos inválidos');
  return parsed.data;
};

/** Whoever posted the offer and the admins can change, close or delete it. */
const requireOwnerOrAdmin = async (id: string) => {
  const user = await requireUser();
  const offer = await prisma.jobOffers.findUnique({
    where: { id: idSchema.parse(id) },
    select: { id: true, authorId: true },
  });
  if (!offer) throw new Error('La oferta no existe');
  if (offer.authorId !== user.id && user.role !== 'ADMIN') {
    throw new Error('Solo quien publicó la oferta puede cambiarla');
  }
  return offer;
};

/** A member posts a job offer to /empleos. */
export async function createJobOffer(input: JobOfferInput) {
  await enforceRateLimit('createContent');
  const user = await requireUser();
  const data = parse(input);
  const offer = await prisma.jobOffers.create({
    data: { ...data, available: true, authorId: user.id },
    select: { id: true, title: true, company: true },
  });
  revalidatePath('/empleos');
  await notifyEveryone(
    {
      type: 'job_offer_created',
      push: true,
      title: 'Nueva oferta de empleo',
      message: `${offer.title} en ${offer.company}.`,
      href: `/empleos?q=${encodeURIComponent(offer.title)}`,
      metadata: { jobOfferId: offer.id },
    },
    user.id,
  );
  return { id: offer.id };
}

export async function updateJobOffer(id: string, input: JobOfferInput) {
  await enforceRateLimit('editContent');
  const offer = await requireOwnerOrAdmin(id);
  await prisma.jobOffers.update({ where: { id: offer.id }, data: parse(input) });
  revalidatePath('/empleos');
}

/** Closes an offer once it's filled (it leaves the list) or opens it again. */
export async function setJobOfferAvailable(id: string, available: boolean) {
  const offer = await requireOwnerOrAdmin(id);
  await prisma.jobOffers.update({
    where: { id: offer.id },
    data: { available: z.boolean().parse(available) },
  });
  revalidatePath('/empleos');
}

export async function deleteJobOffer(id: string) {
  const offer = await requireOwnerOrAdmin(id);
  await prisma.jobOffers.delete({ where: { id: offer.id } });
  revalidatePath('/empleos');
}
