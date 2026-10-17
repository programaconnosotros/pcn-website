// Client-safe path to download a gallery photo or video. It goes through the app so each
// download is rate limited.

export const galleryDownloadUrl = (photoId: string) => `/api/galeria/${photoId}/descargar`;
