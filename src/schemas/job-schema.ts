import { z } from 'zod';

export const jobSchema = z.object({
  title: z
    .string()
    .min(3, { message: 'El título debe tener al menos 3 caracteres' })
    .max(200, { message: 'El título no puede exceder 200 caracteres' }),
  description: z
    .string()
    .min(10, { message: 'La descripción debe tener al menos 10 caracteres' })
    .max(2000, { message: 'La descripción no puede exceder 2000 caracteres' }),
  enterprise: z
    .string()
    .min(2, { message: 'El nombre de la empresa debe tener al menos 2 caracteres' })
    .max(100, { message: 'El nombre de la empresa no puede exceder 100 caracteres' }),
  location: z
    .string()
    .min(2, { message: 'La ubicación debe tener al menos 2 caracteres' })
    .max(100, { message: 'La ubicación no puede exceder 100 caracteres' }),
  type: z
    .string()
    .min(1, { message: 'El tipo de trabajo es requerido' }),
  tags: z
    .string()
    .min(1, { message: 'Ingresa al menos una etiqueta' })
    .transform((val) => val.split(',').map((tag) => tag.trim()).filter(Boolean)),
  available: z.boolean().default(true),
  website: z
    .string()
    .url({ message: 'Debe ser una URL válida' })
    .optional()
    .or(z.literal('')),
});

export type JobFormData = z.input<typeof jobSchema>;
export type JobData = z.infer<typeof jobSchema>;

