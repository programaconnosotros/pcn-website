'use server';

import { getPresignedUploadUrl } from '@/lib/s3';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

type GetPresignedUrlParams = {
  fileName: string;
  contentType: string;
  folder?: string;
};

export async function getPresignedUrl({
  fileName,
  contentType,
  folder = 'events',
}: GetPresignedUrlParams) {
  // Verificar autenticación
  const sessionId = cookies().get('sessionId')?.value;
  if (!sessionId) {
    throw new Error('No autorizado');
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true },
  });

  if (!session || session.user.role !== 'ADMIN') {
    throw new Error('No tienes permisos para subir archivos');
  }

  if (!ALLOWED_TYPES.includes(contentType)) {
    throw new Error(
      'Tipo de archivo no permitido. Solo se permiten imágenes (JPEG, PNG, WebP, GIF)',
    );
  }

  const { uploadUrl, fileUrl } = await getPresignedUploadUrl(fileName, contentType, folder);

  return { uploadUrl, fileUrl };
}

