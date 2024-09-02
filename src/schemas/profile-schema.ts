import { z } from 'zod';

export const profileSchema = z.object({
  name: z.string().min(3, { message: 'El nombre debe tener al menos 3 caracteres' }),
  email: z.string().email({ message: 'El email debe ser válido' }),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
