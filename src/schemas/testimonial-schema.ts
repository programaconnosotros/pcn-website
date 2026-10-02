import { z } from 'zod';

export const testimonialSchema = z.object({
  body: z.string().min(10, { message: 'El testimonio debe tener al menos 10 caracteres' }),
});

export type TestimonialFormData = z.infer<typeof testimonialSchema>;
