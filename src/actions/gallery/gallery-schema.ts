import { z } from 'zod';

// Los videos se optimizan en el navegador antes de subirse (si puede); el archivo subido pesa
// hasta 500 MB.
export const MAX_VIDEO_BYTES = 500 * 1024 * 1024;

// Lo que se carga a mano de una foto: cuándo se sacó, una descripción y de qué evento es.
export const galleryDetailsSchema = z.object({
  takenAt: z
    .union([z.string(), z.date()])
    .transform((value) => new Date(value))
    .refine((date) => !Number.isNaN(date.getTime()), 'Fecha inválida'),
  description: z
    .string()
    .trim()
    .max(500, 'Máximo 500 caracteres')
    .nullish()
    .transform((value) => value || null),
  eventId: z
    .string()
    .nullish()
    .transform((value) => value || null),
});

export type GalleryDetailsInput = z.input<typeof galleryDetailsSchema>;

// Lo que el navegador lee del video al subirlo.
export const videoMetadataSchema = z.object({
  durationSeconds: z
    .number()
    .int()
    .min(0)
    .max(24 * 60 * 60)
    .nullable(),
  width: z.number().int().positive().max(10_000).nullable(),
  height: z.number().int().positive().max(10_000).nullable(),
});

export type VideoMetadataInput = z.input<typeof videoMetadataSchema>;

// The items an admin edits at once from the gallery.
export const MAX_BULK_ITEMS = 500;
export const galleryItemIdsSchema = z
  .array(z.string().min(1))
  .min(1, 'No hay nada seleccionado')
  .max(MAX_BULK_ITEMS, `Máximo ${MAX_BULK_ITEMS} a la vez`)
  .transform((ids) => [...new Set(ids)]);

export const parseGalleryItemIds = (ids: string[]) => {
  const parsed = galleryItemIdsSchema.safeParse(ids);
  if (!parsed.success) throw new Error(parsed.error.errors[0]?.message ?? 'Selección inválida');
  return parsed.data;
};
