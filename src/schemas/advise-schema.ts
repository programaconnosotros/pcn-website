import { z } from 'zod';

export const adviseSchema = z.object({
  content: z
    .string()
    .min(10, { message: 'Tenés que escribir al menos 10 caracteres' })
    .max(400, { message: 'Podés escribir 400 caracteres como máximo' }),
});

export type AdviseFormData = z.infer<typeof adviseSchema>;
