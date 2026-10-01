// Client-safe paths to a gallery photo's image. They go through the app so each request is
// rate limited and turned into a short-lived signed URL.

export type PhotoSize = 'thumb' | 'full';

export const photoImageUrl = (photoId: string, size: PhotoSize = 'thumb') =>
  `/api/galeria/fotos/${photoId}?size=${size}`;

export const photoDownloadUrl = (photoId: string) => `/api/galeria/fotos/${photoId}/descargar`;
