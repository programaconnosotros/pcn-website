import { z } from 'zod';

export const postSchema = z.object({
    title: z.string().min(1, 'El título es requerido'),
    description: z.string().min(1, 'La descripción es requerida'),
    imageUrl: z.string().min(1, 'La imagen es requerida'),
}); 