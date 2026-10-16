'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { enforceRateLimit } from '@/lib/rate-limit';
import { keyFromPublicUrl } from '@/lib/s3';
import { findSession } from '@/lib/session';
import { workPlaceSchema, type WorkPlaceInput } from '@/schemas/work-place-schema';

const requireSession = async () => {
  const sessionId = (await cookies()).get('sessionId')?.value;
  const session = sessionId ? await findSession(sessionId) : null;
  if (!session) throw new Error('No autenticado');
  return session;
};

const parse = (input: WorkPlaceInput) => {
  const data = workPlaceSchema.parse(input);
  // Only photos uploaded to the site's bucket for a place, never any URL.
  if (data.photoUrl && !keyFromPublicUrl(data.photoUrl)?.startsWith('work-places/')) {
    throw new Error('La foto tiene que estar subida al sitio');
  }
  return data;
};

/** Who can edit or delete a place: whoever added it and the admins. */
const requireOwnerOrAdmin = async (id: string) => {
  const session = await requireSession();
  const place = await prisma.workPlace.findUnique({ where: { id }, select: { authorId: true } });
  if (!place) throw new Error('Lugar no encontrado');
  if (place.authorId !== session.userId && session.user.role !== 'ADMIN') {
    throw new Error('No tenés permisos para cambiar este lugar');
  }
};

export const createWorkPlace = async (input: WorkPlaceInput) => {
  await enforceRateLimit('createContent');
  const session = await requireSession();
  const data = parse(input);

  const place = await prisma.workPlace.create({ data: { ...data, authorId: session.userId } });

  revalidatePath('/lugares');
  return { id: place.id };
};

export const updateWorkPlace = async (id: string, input: WorkPlaceInput) => {
  await enforceRateLimit('editContent');
  const placeId = z.string().min(1).parse(id);
  await requireOwnerOrAdmin(placeId);
  const data = parse(input);

  await prisma.workPlace.update({ where: { id: placeId }, data });

  revalidatePath('/lugares');
};

export const deleteWorkPlace = async (id: string) => {
  const placeId = z.string().min(1).parse(id);
  await requireOwnerOrAdmin(placeId);

  await prisma.workPlace.delete({ where: { id: placeId } });

  revalidatePath('/lugares');
};
