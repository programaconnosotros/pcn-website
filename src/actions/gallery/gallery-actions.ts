'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin';
import { optimizePhoto, optimizePoster } from '@/lib/photo-processing';
import {
  deleteObjects,
  deleteObjectsOrLog,
  getObjectBuffer,
  getPresignedPost,
  getPresignedUploadUrl,
  headObject,
  publicFileUrl,
  putImmutableObject,
} from '@/lib/s3';
import {
  MAX_VIDEO_BYTES,
  galleryDetailsSchema,
  videoMetadataSchema,
  type GalleryDetailsInput,
  type VideoMetadataInput,
} from './gallery-schema';

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

const VIDEO_TYPES: Record<string, string> = {
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'video/quicktime': 'mov',
};
// `gallery/<uuid>/video.<ext>`, la key que arma getVideoUploadUrl.
const VIDEO_KEY = /^gallery\/[0-9a-f-]{36}\/video\.(mp4|webm|mov)$/;

const isOriginalKey = (key: string) =>
  key.startsWith(`${ORIGINALS_FOLDER}/`) && !key.includes('..');

const parseDetails = (input: GalleryDetailsInput) => {
  const parsed = galleryDetailsSchema.safeParse(input);
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

const revalidateItem = (photoId: string, eventIds: (string | null)[] = []) => {
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
 * Formulario firmado para subir un video directo a S3 (ya optimizado en el navegador, hasta 500 MB). Devuelve la
 * key, que después se pasa a createVideo. Solo admins.
 */
export async function getVideoUploadUrl(contentType: string, size: number) {
  await requireAdmin();
  const extension = VIDEO_TYPES[contentType];
  if (!extension) throw new Error('Formato no soportado. Subí MP4, WebM o MOV.');
  if (size > MAX_VIDEO_BYTES) throw new Error('El video pesa más de 500 MB.');

  const key = `gallery/${crypto.randomUUID()}/video.${extension}`;
  const { url, fields } = await getPresignedPost(key, contentType, MAX_VIDEO_BYTES);
  return { url, fields, key };
}

/**
 * Crea un video de la galería a partir del archivo ya subido a S3 y de un cuadro capturado en
 * el navegador, que se convierte en su portada (webp). Solo admins.
 */
export async function createVideo(
  videoKey: string,
  posterOriginalKey: string,
  input: GalleryDetailsInput & VideoMetadataInput,
) {
  const admin = await requireAdmin();
  if (!VIDEO_KEY.test(videoKey) || !isOriginalKey(posterOriginalKey)) {
    throw new Error('Archivo inválido');
  }
  const details = parseDetails(input);
  const metadata = videoMetadataSchema.safeParse(input);
  if (!metadata.success) throw new Error('Datos del video inválidos');
  await assertEventExists(details.eventId);

  const video = await headObject(videoKey);
  if (!video) throw new Error('El video no se terminó de subir');

  const poster = await optimizePoster(await getObjectBuffer(posterOriginalKey));
  const posterKey = videoKey.replace(/video\.\w+$/, 'poster.webp');
  await putImmutableObject(posterKey, poster, 'image/webp');
  await deleteObjectsOrLog([posterOriginalKey]);

  const item = await prisma.galleryItem.create({
    data: {
      ...details,
      ...metadata.data,
      kind: 'VIDEO',
      src: publicFileUrl(videoKey),
      thumbSrc: publicFileUrl(posterKey),
      mimeType: video.contentType,
      storageKeys: [videoKey, posterKey],
      uploadedById: admin.id,
    },
    select: { id: true },
  });

  revalidateItem(item.id, [details.eventId]);
  return item;
}

/**
 * Crea una foto a partir del original ya subido: la optimiza a WebP (grande y miniatura), la
 * guarda en S3 para servirla por CloudFront y borra el original. Solo admins.
 */
export async function createPhoto(originalKey: string, input: GalleryDetailsInput) {
  const admin = await requireAdmin();
  if (!isOriginalKey(originalKey)) throw new Error('Archivo inválido');
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
  await deleteObjectsOrLog([originalKey]);

  const photo = await prisma.galleryItem.create({
    data: {
      ...details,
      src: publicFileUrl(fullKey),
      thumbSrc: publicFileUrl(thumbKey),
      mimeType: 'image/webp',
      width,
      height,
      storageKeys: [fullKey, thumbKey],
      uploadedById: admin.id,
    },
    select: { id: true },
  });

  revalidateItem(photo.id, [details.eventId]);
  return photo;
}

/** Cambia la fecha, la descripción o el evento de una foto o video. Solo admins. */
export async function updateGalleryItem(photoId: string, input: GalleryDetailsInput) {
  await requireAdmin();
  const details = parseDetails(input);

  const photo = await prisma.galleryItem.findUnique({
    where: { id: photoId },
    select: { eventId: true },
  });
  if (!photo) throw new Error('Foto no encontrada');
  await assertEventExists(details.eventId);

  await prisma.galleryItem.update({ where: { id: photoId }, data: details });
  revalidateItem(photoId, [photo.eventId, details.eventId]);
  return { success: true };
}

/** Elimina una foto o video, sus etiquetas y sus archivos en S3. Solo admins. */
export async function deleteGalleryItem(photoId: string) {
  await requireAdmin();

  const photo = await prisma.galleryItem.findUnique({
    where: { id: photoId },
    select: { eventId: true, storageKeys: true, tags: { select: { userId: true } } },
  });
  if (!photo) throw new Error('Foto no encontrada');

  // Primero los archivos: si S3 falla, la foto sigue en la galería y se puede reintentar.
  await deleteObjects(photo.storageKeys);
  await prisma.galleryItem.delete({ where: { id: photoId } });

  revalidateItem(photoId, [photo.eventId]);
  photo.tags.forEach(({ userId }) => revalidatePath(`/perfil/${userId}`));
  return { success: true };
}
