import { z } from 'zod';

export const createGalleryPhotoSchema = z.object({
  title: z
    .string()
    .min(3, { message: 'El título debe tener al menos 3 caracteres' })
    .max(200, { message: 'El título no puede exceder 200 caracteres' }),
  location: z
    .string()
    .min(2, { message: 'La ubicación debe tener al menos 2 caracteres' })
    .max(150, { message: 'La ubicación no puede exceder 150 caracteres' }),
  takenAt: z.coerce.date({ required_error: 'La fecha es requerida' }),
  imageUrl: z.string().url({ message: 'La URL de la imagen no es válida' }),
});

export const updateGalleryPhotoSchema = createGalleryPhotoSchema.extend({
  id: z.string().cuid(),
});

export type CreateGalleryPhotoInput = z.infer<typeof createGalleryPhotoSchema>;
export type UpdateGalleryPhotoInput = z.infer<typeof updateGalleryPhotoSchema>;
