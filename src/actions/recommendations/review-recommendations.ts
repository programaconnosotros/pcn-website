'use server';

import { z } from 'zod';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin';
import { missingToPublish, parseRecommendation } from '@/schemas/recommendation-schema';
import {
  DUPLICATE_MESSAGES,
  findDuplicate,
  nextPosition,
  type ActionResult,
} from './recommendation-store';

const idSchema = z.string().trim().min(1).max(100);

const loadItem = async (id: unknown) => {
  const parsed = idSchema.safeParse(id);
  if (!parsed.success) return null;
  return prisma.recommendation.findUnique({ where: { id: parsed.data } });
};

const NOT_FOUND = { success: false as const, error: 'Recomendación no encontrada' };

const missingMessage = (missing: string[]) => `Para publicarla falta: ${missing.join(', ')}`;

/**
 * Corrige o completa una recomendación (pendiente, publicada o rechazada) antes de aprobarla.
 * El video de una recomendación no se cambia: es su clave. Solo admins.
 */
export async function updateRecommendation(id: unknown, input: unknown): Promise<ActionResult> {
  await requireAdmin();
  const item = await loadItem(id);
  if (!item) return NOT_FOUND;

  const parsed = parseRecommendation(item.kind, input, { asAdmin: true });
  if (!parsed.success) return parsed;
  if (item.kind === 'VIDEO' && parsed.youtubeId !== item.slug) {
    return { success: false, error: 'El video no se puede cambiar: recomendá el otro aparte' };
  }
  if (item.status === 'APPROVED') {
    const missing = missingToPublish(item.kind, parsed.data);
    if (missing.length) return { success: false, error: missingMessage(missing) };
  }
  const duplicate = await findDuplicate(item.kind, parsed.data, parsed.youtubeId, item.id);
  if (duplicate) return { success: false, error: DUPLICATE_MESSAGES[duplicate.status] };

  await prisma.recommendation.update({ where: { id: item.id }, data: parsed.data });
  return { success: true };
}

/** Publica una recomendación pendiente (o una rechazada antes), si tiene todo lo que la lista muestra. Solo admins. */
export async function approveRecommendation(id: unknown): Promise<ActionResult> {
  const admin = await requireAdmin();
  const item = await loadItem(id);
  if (!item) return NOT_FOUND;
  if (item.status === 'APPROVED') return { success: true };

  const missing = missingToPublish(item.kind, item);
  if (missing.length) return { success: false, error: missingMessage(missing) };

  await prisma.recommendation.update({
    where: { id: item.id },
    data: {
      status: 'APPROVED',
      reviewedById: admin.id,
      reviewedAt: new Date(),
      position: await nextPosition(item.kind),
    },
  });
  return { success: true };
}

/**
 * Rechaza una recomendación pendiente, o saca de la lista una publicada. Queda guardada como
 * rechazada para que nadie la vuelva a mandar. Solo admins.
 */
export async function rejectRecommendation(id: unknown): Promise<ActionResult> {
  const admin = await requireAdmin();
  const item = await loadItem(id);
  if (!item) return NOT_FOUND;
  if (item.status === 'REJECTED') return { success: true };

  await prisma.recommendation.update({
    where: { id: item.id },
    data: { status: 'REJECTED', reviewedById: admin.id, reviewedAt: new Date() },
  });
  return { success: true };
}
