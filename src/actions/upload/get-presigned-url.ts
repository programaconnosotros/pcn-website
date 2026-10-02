'use server';

import { getImageUploadForm } from '@/lib/s3';
import { cookies } from 'next/headers';
import { enforceRateLimit } from '@/lib/rate-limit';
import { findSession } from '@/lib/session';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
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

  if (!ALLOWED_TYPES.includes(contentType)) {
    throw new Error(
      'Tipo de archivo no permitido. Solo se permiten imágenes (JPEG, PNG, WebP, GIF)',
    );
  }

  return getImageUploadForm(contentType, folder);
}
