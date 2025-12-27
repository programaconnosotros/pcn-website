import { z } from 'zod';

export const eventSchema = z.object({
  name: z
    .string()
    .min(3, { message: 'El nombre debe tener al menos 3 caracteres' })
    .max(200, { message: 'El nombre no puede exceder 200 caracteres' }),
  description: z
    .string()
    .min(10, { message: 'La descripción debe tener al menos 10 caracteres' })
    .max(2000, { message: 'La descripción no puede exceder 2000 caracteres' }),
  date: z.string().min(1, { message: 'La fecha es requerida' }),
  endDate: z
    .string()
    .optional()
    .transform((val) => (val === '' || val === undefined ? undefined : val)),
  city: z
    .string()
    .min(2, { message: 'La ciudad debe tener al menos 2 caracteres' })
    .max(100, { message: 'La ciudad no puede exceder 100 caracteres' }),
  address: z
    .string()
    .min(5, { message: 'La dirección debe tener al menos 5 caracteres' })
    .max(200, { message: 'La dirección no puede exceder 200 caracteres' }),
  placeName: z
    .string()
    .min(2, { message: 'El nombre del lugar debe tener al menos 2 caracteres' })
    .max(100, { message: 'El nombre del lugar no puede exceder 100 caracteres' }),
  flyerSrc: z
    .string()
    .min(1, { message: 'Debes subir una imagen del flyer' })
    .url({ message: 'La imagen del flyer no es válida' }),
  latitude: z.preprocess(
    (val) => {
      if (val === null || val === undefined) return '';
      if (typeof val === 'number') return val.toString();
      return val;
    },
    z
      .string()
      .optional()
      .transform((val) => (val === '' || val === undefined ? undefined : parseFloat(val)))
      .refine((val) => val === undefined || (!isNaN(val) && val >= -90 && val <= 90), {
        message: 'La latitud debe ser un número entre -90 y 90',
      }),
  ),
  longitude: z.preprocess(
    (val) => {
      if (val === null || val === undefined) return '';
      if (typeof val === 'number') return val.toString();
      return val;
    },
    z
      .string()
      .optional()
      .transform((val) => (val === '' || val === undefined ? undefined : parseFloat(val)))
      .refine((val) => val === undefined || (!isNaN(val) && val >= -180 && val <= 180), {
        message: 'La longitud debe ser un número entre -180 y 180',
      }),
  ),
  sponsors: z
    .array(
      z.object({
        name: z.string().min(1, { message: 'El nombre del sponsor es requerido' }),
        website: z
          .string()
          .optional()
          .refine((val) => !val || val === '' || z.string().url().safeParse(val).success, {
            message: 'Debe ser una URL válida',
          })
          .transform((val) => (val === '' ? undefined : val)),
      }),
    )
    .optional()
    .default([]),
  capacity: z.preprocess(
    (val) => {
      // Convertir number o null a string para el formulario
      if (val === null || val === undefined) return '';
      if (typeof val === 'number') return val.toString();
      return val;
    },
    z
      .string()
      .optional()
      .transform((val) => (val === '' || val === undefined ? undefined : parseInt(val, 10)))
      .refine((val) => val === undefined || (!isNaN(val) && val > 0), {
        message: 'El cupo debe ser un número mayor a 0',
      }),
  ),
});

// Tipo de entrada del formulario (antes del transform)
export type EventFormData = z.input<typeof eventSchema>;

// Tipo de salida después de la validación (después del transform)
export type EventData = z.infer<typeof eventSchema>;
