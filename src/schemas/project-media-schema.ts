// Límites de las fotos y videos de la página de un proyecto, compartidos por el formulario y las
// server actions.

export const PROJECT_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
export const PROJECT_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

/** Tope de la foto original; S3 rechaza lo que pase de acá. */
export const PROJECT_IMAGE_MAX_BYTES = 15 * 1024 * 1024;
/** Tope del video ya optimizado en el navegador (o del original, si no se pudo optimizar). */
export const PROJECT_VIDEO_MAX_BYTES = 300 * 1024 * 1024;
/** Cuántas fotos y videos puede tener un proyecto. */
export const PROJECT_MEDIA_LIMIT = 24;
