'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentSession } from '@/actions/auth/get-current-session';
import prisma from '@/lib/prisma';
import { optimizePhoto } from '@/lib/photo-processing';
import { enforceRateLimit } from '@/lib/rate-limit';
import {
  deleteObjects,
  deleteObjectsOrLog,
  getObjectBuffer,
  getPresignedPost,
  publicFileUrl,
  putImmutableObject,
} from '@/lib/s3';
import { SETUP_MAX_BYTES, setupSchema, type SetupFormData } from '@/schemas/setup-schema';

// El original se sube directo a S3 desde el navegador, a una carpeta de quien lo sube, y se
// borra después de optimizarlo.
const ORIGINALS_FOLDER = 'setups/originals';
const EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
};
const ORIGINAL_FILE = /^[0-9a-f-]{36}\.(jpg|png|webp|avif)$/;

const isOwnOriginalKey = (key: string, userId: string) => {
  const prefix = `${ORIGINALS_FOLDER}/${userId}/`;
  return key.startsWith(prefix) && ORIGINAL_FILE.test(key.slice(prefix.length));
};

async function requireUser() {
  const session = await getCurrentSession();
  if (!session) throw new Error('Debes estar autenticado');
  return session.user;
}

const parseDetails = (input: SetupFormData) => {
  const parsed = setupSchema.safeParse(input);
  if (!parsed.success) throw new Error(parsed.error.errors[0]?.message ?? 'Datos inválidos');
  return parsed.data;
};

const revalidateSetup = (setupId: string, authorId: string) => {
  revalidatePath('/setups');
  revalidatePath(`/setups/${setupId}`);
  revalidatePath(`/perfil/${authorId}`);
  revalidatePath('/feed');
};

/**
 * Optimiza el original ya subido a WebP (grande y miniatura), lo guarda en S3 para servirlo por
 * CloudFront y borra el original.
 */
async function storePhoto(originalKey: string) {
  const original = await getObjectBuffer(originalKey);
  let photo: Awaited<ReturnType<typeof optimizePhoto>>;
  try {
    photo = await optimizePhoto(original);
  } catch (error) {
    console.error('setups: could not optimize photo', error);
    await deleteObjectsOrLog([originalKey]);
    throw new Error('No pudimos leer la foto. Probá con otro archivo.');
  }

  const folder = `setups/${crypto.randomUUID()}`;
  const fullKey = `${folder}/full.webp`;
  const thumbKey = `${folder}/thumb.webp`;
  await Promise.all([
    putImmutableObject(fullKey, photo.full, 'image/webp'),
    putImmutableObject(thumbKey, photo.thumb, 'image/webp'),
  ]);
  await deleteObjectsOrLog([originalKey]);

  return {
    imageUrl: publicFileUrl(fullKey),
    thumbUrl: publicFileUrl(thumbKey),
    width: photo.width,
    height: photo.height,
    storageKeys: [fullKey, thumbKey],
  };
}

/** Formulario firmado para subir la foto original de un setup directo a S3. */
export async function getSetupUploadForm(contentType: string) {
  await enforceRateLimit('upload');
  const user = await requireUser();

  const extension = EXTENSIONS[contentType];
  if (!extension) throw new Error('Formato no soportado. Subí JPG, PNG, WebP o AVIF.');

  const key = `${ORIGINALS_FOLDER}/${user.id}/${crypto.randomUUID()}.${extension}`;
  const { url, fields } = await getPresignedPost(key, contentType, SETUP_MAX_BYTES);
  return { url, fields, key };
}

/** Publica el setup de quien está logueado, con la foto que ya subió a S3. */
export async function createSetup(originalKey: string, input: SetupFormData) {
  await enforceRateLimit('createContent');
  const user = await requireUser();
  if (!isOwnOriginalKey(originalKey, user.id)) throw new Error('Archivo inválido');
  const details = parseDetails(input);

  const photo = await storePhoto(originalKey);
  const setup = await prisma.setup.create({
    data: { ...details, ...photo, authorId: user.id },
    select: { id: true },
  });

  revalidateSetup(setup.id, user.id);
  return setup;
}

/**
 * Edita el título y la descripción de un setup y, si viene `originalKey`, le cambia la foto
 * (la anterior se borra de S3). Solo quien lo publicó.
 */
export async function updateSetup(
  setupId: string,
  input: SetupFormData,
  originalKey?: string | null,
) {
  const user = await requireUser();
  const setup = await prisma.setup.findUnique({
    where: { id: setupId },
    select: { authorId: true, storageKeys: true },
  });
  if (!setup) throw new Error('Setup no encontrado');
  if (setup.authorId !== user.id) throw new Error('No tenés permisos para editar este setup');
  if (originalKey && !isOwnOriginalKey(originalKey, user.id)) throw new Error('Archivo inválido');
  const details = parseDetails(input);

  const photo = originalKey ? await storePhoto(originalKey) : null;
  await prisma.setup.update({ where: { id: setupId }, data: { ...details, ...photo } });
  if (photo) await deleteObjectsOrLog(setup.storageKeys);

  revalidateSetup(setupId, user.id);
}

/** Borra un setup y su foto. Puede hacerlo quien lo publicó o un admin. */
export async function deleteSetup(setupId: string) {
  const user = await requireUser();
  const setup = await prisma.setup.findUnique({
    where: { id: setupId },
    select: { authorId: true, storageKeys: true },
  });
  if (!setup) throw new Error('Setup no encontrado');
  if (setup.authorId !== user.id && user.role !== 'ADMIN') {
    throw new Error('No tenés permisos para eliminar este setup');
  }

  // Primero los archivos: si S3 falla, el setup sigue publicado y se puede reintentar.
  await deleteObjects(setup.storageKeys);
  await prisma.setup.delete({ where: { id: setupId } });

  revalidateSetup(setupId, setup.authorId);
}

/** Da o saca el like de quien está logueado. Devuelve cómo quedó. */
export async function toggleSetupLike(setupId: string) {
  const user = await requireUser();
  const where = { setupId_userId: { setupId, userId: user.id } };

  const existing = await prisma.setupLike.findUnique({ where, select: { id: true } });
  if (existing) {
    await prisma.setupLike.delete({ where: { id: existing.id } });
  } else {
    await prisma.setupLike.create({ data: { setupId, userId: user.id } });
  }

  revalidatePath('/setups');
  revalidatePath(`/setups/${setupId}`);
  return { liked: !existing };
}
