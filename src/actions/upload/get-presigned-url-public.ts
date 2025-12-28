'use server';

import { getPresignedUploadUrl } from '@/lib/s3';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

type GetPresignedUrlPublicParams = {
  fileName: string;
  contentType: string;
};

/**
 * Obtiene una URL pre-firmada para subir imágenes de perfil durante el registro.
 * Esta función NO requiere autenticación, pero está limitada a la carpeta 'registration-profiles'.
 */
export async function getPresignedUrlPublic({ fileName, contentType }: GetPresignedUrlPublicParams) {
  if (!ALLOWED_TYPES.includes(contentType)) {
    throw new Error(
      'Tipo de archivo no permitido. Solo se permiten imágenes (JPEG, PNG, WebP, GIF)',
    );
  }

  // Siempre usar la carpeta registration-profiles para mayor seguridad
  const { uploadUrl, fileUrl } = await getPresignedUploadUrl(
    fileName,
    contentType,
    'registration-profiles',
  );

  return { uploadUrl, fileUrl };
}

