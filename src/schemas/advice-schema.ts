import { z } from 'zod';

export const adviceSchema = z.object({
  content: z
    .string()
    .min(10, { message: 'Tenés que escribir al menos 10 caracteres' })
    .max(1000, { message: 'Podés escribir 1000 caracteres como máximo' }),
  tags: z
    .array(
      z
        .string()
        .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, { message: 'Categoría inválida' })
        .min(2)
        .max(24),
    )
    .max(3, { message: 'Elegí 3 categorías como máximo' }),
});

export type AdviceFormData = z.infer<typeof adviceSchema>;
