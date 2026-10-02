import { z } from 'zod';

export const setupSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, { message: 'El título tiene que tener al menos 3 caracteres' })
    .max(80, { message: 'El título puede tener 80 caracteres como máximo' }),
  description: z
    .string()
    .trim()
    .min(10, { message: 'Contá un poco más: al menos 10 caracteres' })
    .max(1500, { message: 'La descripción puede tener 1500 caracteres como máximo' }),
});

export type SetupFormData = z.infer<typeof setupSchema>;

/** Formatos de foto que se aceptan; sharp los pasa todos a webp. */
export const SETUP_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

/** Tope del original; S3 rechaza lo que pase de acá. */
export const SETUP_MAX_BYTES = 10 * 1024 * 1024;
