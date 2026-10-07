import { z } from 'zod';

export const forumPostSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, { message: 'El título tiene que tener al menos 5 caracteres' })
    .max(140, { message: 'El título puede tener 140 caracteres como máximo' }),
  categoryId: z.string().min(1, { message: 'Elegí una categoría' }).max(64),
  content: z
    .string()
    .trim()
    .min(20, { message: 'Contá un poco más: al menos 20 caracteres' })
    .max(20_000, { message: 'El tema puede tener 20.000 caracteres como máximo' }),
});

export type ForumPostFormData = z.infer<typeof forumPostSchema>;

export const forumCommentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, { message: 'La respuesta no puede estar vacía' })
    .max(5_000, { message: 'La respuesta puede tener 5.000 caracteres como máximo' }),
  parentCommentId: z.string().max(64).nullable(),
});

export type ForumCommentFormData = z.infer<typeof forumCommentSchema>;
