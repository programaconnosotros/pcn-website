'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin';
import { optimizePhoto } from '@/lib/photo-processing';
import {
  deleteObjects,
  getObjectBuffer,
  getPresignedUploadUrl,
  publicFileUrl,
  putImmutableObject,
} from '@/lib/s3';
import { photoDetailsSchema, type PhotoDetailsInput } from './photo-schema';

// Los originales se suben directo a S3 desde el navegador y se borran después de optimizarlos.
const ORIGINALS_FOLDER = 'gallery/originals';
const UPLOAD_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/tiff',
  'image/gif',
];

const parseDetails = (input: PhotoDetailsInput) => {
  const parsed = photoDetailsSchema.safeParse(input);
  if (!parsed.success) throw new Error(parsed.error.errors[0]?.message ?? 'Datos inválidos');
  return parsed.data;
};

async function assertEventExists(eventId: string | null) {
  if (!eventId) return;
  const event = await prisma.event.findFirst({
    where: { id: eventId, deletedAt: null },
    select: { id: true },
  });
  if (!event) throw new Error('Evento no encontrado');
}

const revalidatePhoto = (photoId: string, eventIds: (string | null)[] = []) => {
  revalidatePath('/galeria');
  revalidatePath(`/galeria/${photoId}`);
  eventIds.forEach((eventId) => eventId && revalidatePath(`/eventos/${eventId}`));
};

/** URL firmada para subir el original de una foto a S3. Solo admins. */
export async function getPhotoUploadUrl(fileName: string, contentType: string) {
  await requireAdmin();
  if (!UPLOAD_TYPES.includes(contentType)) {
    throw new Error('Formato no soportado. Subí JPG, PNG, WebP, AVIF, TIFF o GIF.');
  }

  const { uploadUrl, key } = await getPresignedUploadUrl(fileName, contentType, ORIGINALS_FOLDER);
  return { uploadUrl, key };
}

/**
 * Crea una foto a partir del original ya subido: la optimiza a WebP (grande y miniatura), la
 * guarda en S3 para servirla por CloudFront y borra el original. Solo admins.
 */
export async function createPhoto(originalKey: string, input: PhotoDetailsInput) {
  const admin = await requireAdmin();
  if (!originalKey.startsWith(`${ORIGINALS_FOLDER}/`) || originalKey.includes('..')) {
    throw new Error('Archivo inválido');
  }
  const details = parseDetails(input);
  await assertEventExists(details.eventId);

  const { full, thumb, width, height } = await optimizePhoto(await getObjectBuffer(originalKey));

  const folder = `gallery/${crypto.randomUUID()}`;
  const fullKey = `${folder}/full.webp`;
  const thumbKey = `${folder}/thumb.webp`;
  await Promise.all([
    putImmutableObject(fullKey, full, 'image/webp'),
    putImmutableObject(thumbKey, thumb, 'image/webp'),
  ]);
  await deleteObjects([originalKey]);

  const photo = await prisma.photo.create({
    data: {
      ...details,
      src: publicFileUrl(fullKey),
      thumbSrc: publicFileUrl(thumbKey),
      width,
      height,
      storageKeys: [fullKey, thumbKey],
      uploadedById: admin.id,
    },
    select: { id: true },
  });

  revalidatePhoto(photo.id, [details.eventId]);
  return photo;
}
