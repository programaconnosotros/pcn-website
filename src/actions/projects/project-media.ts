'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { optimizePhoto, optimizePoster } from '@/lib/photo-processing';
import { enforceRateLimit } from '@/lib/rate-limit';
import {
  deleteObjectsOrLog,
  getObjectBuffer,
  getPresignedPost,
  headObject,
  publicFileUrl,
  putImmutableObject,
} from '@/lib/s3';
import { videoMetadataSchema, type VideoMetadataInput } from '@/actions/gallery/gallery-schema';
import {
  PROJECT_IMAGE_MAX_BYTES,
  PROJECT_MEDIA_LIMIT,
  PROJECT_VIDEO_MAX_BYTES,
  projectMediaDetailsSchema,
  type ProjectMediaDetailsInput,
} from '@/schemas/project-media-schema';
import { canEditProject, requireSessionUser } from './get-session-user';

// Las fotos (y la portada de cada video) se suben a una carpeta de quien las sube y se borran
// después de optimizarlas; los videos llegan ya optimizados a la carpeta del proyecto.
const ORIGINALS_FOLDER = 'projects/originals';
const IMAGE_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
};
const VIDEO_EXTENSIONS: Record<string, string> = {
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'video/quicktime': 'mov',
};
const ORIGINAL_FILE = /^[0-9a-f-]{36}\.(jpg|png|webp|avif)$/;
const VIDEO_FILE = /^[0-9a-f-]{36}\/video\.(mp4|webm|mov)$/;

const idSchema = z.string().min(1).max(64);

const isOwnOriginalKey = (key: string, userId: string) => {
  const prefix = `${ORIGINALS_FOLDER}/${userId}/`;
  return key.startsWith(prefix) && ORIGINAL_FILE.test(key.slice(prefix.length));
};

const isProjectVideoKey = (key: string, projectId: string) => {
  const prefix = `projects/${projectId}/`;
  return key.startsWith(prefix) && VIDEO_FILE.test(key.slice(prefix.length));
};

/** Quien está logueado, si puede editar el proyecto (el autor, un colaborador o un admin). */
async function requireProjectEditor(projectId: string) {
  const user = await requireSessionUser();
  const project = await prisma.project.findUnique({
    where: { id: idSchema.parse(projectId) },
    select: {
      id: true,
      authorId: true,
      members: { select: { userId: true } },
      _count: { select: { media: true } },
    },
  });
  if (!project) throw new Error('Proyecto no encontrado');
  if (!canEditProject(user, project))
    throw new Error('No tenés permisos para realizar esta acción');
  return { user, project };
}

const parseDetails = (input: ProjectMediaDetailsInput = {}) => {
  const parsed = projectMediaDetailsSchema.safeParse(input);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? 'Datos inválidos');
  return parsed.data;
};

const assertRoom = (project: { _count: { media: number } }) => {
  if (project._count.media >= PROJECT_MEDIA_LIMIT) {
    throw new Error(`Un proyecto puede tener hasta ${PROJECT_MEDIA_LIMIT} fotos y videos.`);
  }
};

const nextOrder = async (projectId: string) => {
  const last = await prisma.projectMedia.aggregate({
    where: { projectId },
    _max: { order: true },
  });
  return (last._max.order ?? -1) + 1;
};

const revalidateProject = (projectId: string) => {
  revalidatePath('/proyectos');
  revalidatePath(`/proyectos/${projectId}`);
};

/**
 * Formulario firmado para subir una foto (o la portada de un video) directo a S3. Devuelve la key,
 * que después se pasa a addProjectPhoto o addProjectVideo.
 */
export async function getProjectImageUploadForm(projectId: string, contentType: string) {
  await enforceRateLimit('upload');
  const { user, project } = await requireProjectEditor(projectId);
  assertRoom(project);

  const extension = IMAGE_EXTENSIONS[contentType];
  if (!extension) throw new Error('Formato no soportado. Subí JPG, PNG, WebP, AVIF o HEIC.');

  const key = `${ORIGINALS_FOLDER}/${user.id}/${crypto.randomUUID()}.${extension}`;
  const { url, fields } = await getPresignedPost(key, contentType, PROJECT_IMAGE_MAX_BYTES);
  return { url, fields, key };
}

/** Formulario firmado para subir un video, ya optimizado en el navegador, directo a S3. */
export async function getProjectVideoUploadForm(
  projectId: string,
  contentType: string,
  size: number,
) {
  await enforceRateLimit('upload');
  const { project } = await requireProjectEditor(projectId);
  assertRoom(project);

  const extension = VIDEO_EXTENSIONS[contentType];
  if (!extension) throw new Error('Formato no soportado. Subí MP4, WebM o MOV.');
  if (size > PROJECT_VIDEO_MAX_BYTES) {
    throw new Error(`El video pesa más de ${PROJECT_VIDEO_MAX_BYTES / 1024 / 1024} MB.`);
  }

  const key = `projects/${project.id}/${crypto.randomUUID()}/video.${extension}`;
  const { url, fields } = await getPresignedPost(key, contentType, PROJECT_VIDEO_MAX_BYTES);
  return { url, fields, key };
}

/**
 * Optimiza a WebP (grande y miniatura) la foto ya subida a S3 y la suma al proyecto, con su
 * descripción y el día en que se sacó.
 */
export async function addProjectPhoto(
  projectId: string,
  originalKey: string,
  input: ProjectMediaDetailsInput = {},
) {
  await enforceRateLimit('createContent');
  const { user, project } = await requireProjectEditor(projectId);
  if (!isOwnOriginalKey(originalKey, user.id)) throw new Error('Archivo inválido');
  const details = parseDetails(input);
  assertRoom(project);

  let photo: Awaited<ReturnType<typeof optimizePhoto>>;
  try {
    photo = await optimizePhoto(await getObjectBuffer(originalKey));
  } catch (error) {
    console.error('projects: could not optimize photo', error);
    await deleteObjectsOrLog([originalKey]);
    throw new Error('No pudimos leer la foto. Probá con otro archivo.');
  }

  const folder = `projects/${project.id}/${crypto.randomUUID()}`;
  const fullKey = `${folder}/full.webp`;
  const thumbKey = `${folder}/thumb.webp`;
  await Promise.all([
    putImmutableObject(fullKey, photo.full, 'image/webp'),
    putImmutableObject(thumbKey, photo.thumb, 'image/webp'),
  ]);
  await deleteObjectsOrLog([originalKey]);

  const media = await prisma.projectMedia.create({
    data: {
      ...details,
      projectId: project.id,
      kind: 'PHOTO',
      src: publicFileUrl(fullKey),
      thumbSrc: publicFileUrl(thumbKey),
      width: photo.width,
      height: photo.height,
      storageKeys: [fullKey, thumbKey],
      order: await nextOrder(project.id),
    },
    select: { id: true },
  });

  revalidateProject(project.id);
  return media;
}

/**
 * Suma al proyecto un video ya subido a S3, con un cuadro capturado en el navegador como
 * portada (se convierte a WebP).
 */
export async function addProjectVideo(
  projectId: string,
  videoKey: string,
  posterOriginalKey: string,
  input: VideoMetadataInput & ProjectMediaDetailsInput,
) {
  await enforceRateLimit('createContent');
  const { user, project } = await requireProjectEditor(projectId);
  if (!isProjectVideoKey(videoKey, project.id) || !isOwnOriginalKey(posterOriginalKey, user.id)) {
    throw new Error('Archivo inválido');
  }
  const metadata = videoMetadataSchema.safeParse(input);
  if (!metadata.success) throw new Error('Datos del video inválidos');
  const details = parseDetails({ description: input.description, takenAt: input.takenAt });
  assertRoom(project);

  const video = await headObject(videoKey);
  if (!video) throw new Error('El video no se terminó de subir');

  const poster = await optimizePoster(await getObjectBuffer(posterOriginalKey));
  const posterKey = videoKey.replace(/video\.\w+$/, 'poster.webp');
  await putImmutableObject(posterKey, poster, 'image/webp');
  await deleteObjectsOrLog([posterOriginalKey]);

  const media = await prisma.projectMedia.create({
    data: {
      ...metadata.data,
      ...details,
      projectId: project.id,
      kind: 'VIDEO',
      src: publicFileUrl(videoKey),
      thumbSrc: publicFileUrl(posterKey),
      storageKeys: [videoKey, posterKey],
      order: await nextOrder(project.id),
    },
    select: { id: true },
  });

  revalidateProject(project.id);
  return media;
}

/** Cambia la descripción o el día de una foto o un video del proyecto. */
export async function updateProjectMediaDetails(mediaId: string, input: ProjectMediaDetailsInput) {
  await enforceRateLimit('editContent');
  const user = await requireSessionUser();
  const details = parseDetails(input);
  const media = await prisma.projectMedia.findUnique({
    where: { id: idSchema.parse(mediaId) },
    select: {
      id: true,
      project: { select: { id: true, authorId: true, members: { select: { userId: true } } } },
    },
  });
  if (!media) throw new Error('Archivo no encontrado');
  if (!canEditProject(user, media.project)) {
    throw new Error('No tenés permisos para realizar esta acción');
  }

  await prisma.projectMedia.update({ where: { id: media.id }, data: details });
  revalidateProject(media.project.id);
  return { success: true };
}

/** Quita una foto o un video del proyecto y borra sus archivos de S3. */
export async function deleteProjectMedia(mediaId: string) {
  const user = await requireSessionUser();
  const media = await prisma.projectMedia.findUnique({
    where: { id: idSchema.parse(mediaId) },
    select: {
      id: true,
      storageKeys: true,
      project: { select: { id: true, authorId: true, members: { select: { userId: true } } } },
    },
  });
  if (!media) throw new Error('Archivo no encontrado');
  if (!canEditProject(user, media.project)) {
    throw new Error('No tenés permisos para realizar esta acción');
  }

  await prisma.projectMedia.delete({ where: { id: media.id } });
  await deleteObjectsOrLog(media.storageKeys);

  revalidateProject(media.project.id);
  return { success: true };
}
