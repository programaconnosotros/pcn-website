import { z } from 'zod';

export const profileSchema = z.object({
  name: z.string().min(3, { message: 'El nombre debe tener al menos 3 caracteres' }),
  email: z.string().email({ message: 'El email debe ser válido' }),
  favoriteProgrammingLanguage: z.string().optional().nullable(),
  countryOfOrigin: z.string().optional().nullable(),
  xAccountUrl: z.string().url({ message: 'La URL de X debe ser válida' }).optional().nullable(),
  linkedinUrl: z
    .string()
    .url({ message: 'La URL de LinkedIn debe ser válida' })
    .optional()
    .nullable(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
