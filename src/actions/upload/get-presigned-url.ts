'use server';

import { getImageUploadForm } from '@/lib/s3';
import { cookies } from 'next/headers';
import { enforceRateLimit } from '@/lib/rate-limit';
import { ALLOWED_IMAGE_TYPES, IMAGE_TYPE_ERROR } from '@/lib/image-types';
import { findSession } from '@/lib/session';

const USER_UPLOAD_FOLDERS = ['profiles', 'project-logos'];

type GetPresignedUrlParams = {
  contentType: string;
  folder?: string;
};

export async function getPresignedUrl({ contentType, folder = 'events' }: GetPresignedUrlParams) {
  await enforceRateLimit('upload');

  // Verificar autenticación
  const sessionId = (await cookies()).get('sessionId')?.value;
  if (!sessionId) {
    throw new Error('No autorizado');
  }

  const session = await findSession(sessionId);

  if (!session) {
    throw new Error('No autorizado');
  }

  // Permitir subir archivos si es ADMIN, o si es para el perfil o un proyecto del usuario
  const isUserUpload = USER_UPLOAD_FOLDERS.includes(folder);
  if (!isUserUpload && session.user.role !== 'ADMIN') {
    throw new Error('No tienes permisos para subir archivos');
  }

  if (!ALLOWED_IMAGE_TYPES.includes(contentType)) {
    throw new Error(IMAGE_TYPE_ERROR);
  }

  return getImageUploadForm(contentType, folder);
}
