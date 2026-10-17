import { z } from 'zod';
import { todayInputValue } from '@/schemas/setup-schema';

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

/** Lo que se carga de cada foto o video: una descripción opcional y el día en que se sacó. */
export const projectMediaDetailsSchema = z.object({
  description: z
    .string()
    .trim()
    .max(500, 'Máximo 500 caracteres')
    .nullish()
    .transform((value) => value || null),
  /** `YYYY-MM-DD`. Puede ser de antes pero no del futuro. */
  takenAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Elegí una fecha válida' })
    .refine((value) => !Number.isNaN(Date.parse(value)), { message: 'Elegí una fecha válida' })
    .refine((value) => value <= todayInputValue(1), { message: 'La fecha no puede ser del futuro' })
    .nullish()
    .transform((value) => (value ? new Date(`${value}T00:00:00.000Z`) : null)),
});

export type ProjectMediaDetailsInput = z.input<typeof projectMediaDetailsSchema>;
