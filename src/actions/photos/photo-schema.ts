import { z } from 'zod';

// Lo que se carga a mano de una foto: cuándo se sacó, una descripción y de qué evento es.
export const photoDetailsSchema = z.object({
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

export type PhotoDetailsInput = z.input<typeof photoDetailsSchema>;
