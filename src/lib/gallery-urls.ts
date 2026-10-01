// Client-safe paths to a gallery photo's image. They go through the app so each request is
// rate limited and turned into a short-lived signed URL.

export type PhotoSize = 'thumb' | 'full';

export const galleryImageUrl = (photoId: string, size: PhotoSize = 'thumb') =>
  `/api/galeria/${photoId}?size=${size}`;

export const galleryDownloadUrl = (photoId: string) => `/api/galeria/${photoId}/descargar`;
