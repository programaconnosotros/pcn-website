'use server';

import { getImageUploadForm } from '@/lib/s3';
import { enforceRateLimit } from '@/lib/rate-limit';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

type GetPresignedUrlPublicParams = {
  contentType: string;
};

/**
 * Obtiene una URL pre-firmada para subir imágenes de perfil durante el registro.
 * Esta función NO requiere autenticación, pero está limitada a la carpeta 'registration-profiles'.
 */
export async function getPresignedUrlPublic({ contentType }: GetPresignedUrlPublicParams) {
  await enforceRateLimit('upload');

  if (!ALLOWED_TYPES.includes(contentType)) {
    throw new Error(
      'Tipo de archivo no permitido. Solo se permiten imágenes (JPEG, PNG, WebP, GIF)',
    );
  }

  // Siempre usar la carpeta registration-profiles para mayor seguridad
  return getImageUploadForm(contentType, 'registration-profiles');
}
