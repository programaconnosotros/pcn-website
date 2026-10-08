/** Las imágenes que se pueden subir al bucket: lo valida el form antes de subir y la action al firmar. */
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export const IMAGE_TYPE_ERROR =
  'Tipo de archivo no permitido. Solo se permiten imágenes (JPEG, PNG, WebP, GIF, HEIC)';

export const isAllowedImage = (file: { type: string }) => ALLOWED_IMAGE_TYPES.includes(file.type);
