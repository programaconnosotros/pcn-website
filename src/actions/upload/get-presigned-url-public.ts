'use server';

import { getImageUploadForm } from '@/lib/s3';
import { enforceRateLimit } from '@/lib/rate-limit';
import { ALLOWED_IMAGE_TYPES, IMAGE_TYPE_ERROR } from '@/lib/image-types';

type GetPresignedUrlPublicParams = {
  contentType: string;
};

/**
 * Obtiene una URL pre-firmada para subir imágenes de perfil durante el registro.
 * Esta función NO requiere autenticación, pero está limitada a la carpeta 'registration-profiles'.
 */
export async function getPresignedUrlPublic({ contentType }: GetPresignedUrlPublicParams) {
  await enforceRateLimit('upload');

  if (!ALLOWED_IMAGE_TYPES.includes(contentType)) {
    throw new Error(IMAGE_TYPE_ERROR);
  }

  // Siempre usar la carpeta registration-profiles para mayor seguridad
  return getImageUploadForm(contentType, 'registration-profiles');
}
