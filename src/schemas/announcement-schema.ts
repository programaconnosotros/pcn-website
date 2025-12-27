import { z } from 'zod';

export const announcementSchema = z.object({
  title: z
    .string()
    .min(3, { message: 'El título debe tener al menos 3 caracteres' })
    .max(200, { message: 'El título no puede exceder 200 caracteres' }),
  content: z
    .string()
    .min(10, { message: 'El contenido debe tener al menos 10 caracteres' })
    .max(5000, { message: 'El contenido no puede exceder 5000 caracteres' }),
  category: z.string().min(1, { message: 'La categoría es requerida' }),
  pinned: z.boolean().default(false),
  published: z.boolean().default(true),
  eventId: z.string().optional().nullable(),
});

export type AnnouncementFormData = z.infer<typeof announcementSchema>;
