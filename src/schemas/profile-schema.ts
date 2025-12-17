import { z } from 'zod';
import { UserProgrammingLanguage } from '@/types/programming-language';

export const profileSchema = z.object({
  name: z.string().min(3, { message: 'El nombre debe tener al menos 3 caracteres' }),
  email: z.string().email({ message: 'El email debe ser válido' }),
  countryOfOrigin: z.string().optional().nullable(),
  xAccountUrl: z.string().url({ message: 'La URL de X debe ser válida' }).optional().nullable(),
  linkedinUrl: z
    .string()
    .url({ message: 'La URL de LinkedIn debe ser válida' })
    .optional()
    .nullable(),
  gitHubUrl: z.string().url({ message: 'La URL de GitHub debe ser válida' }).optional().nullable(),
  programmingLanguages: z.array(
    z.object({
      languageId: z.string(),
      color: z.string(),
      logo: z.string(),
      experienceLevel: z.number().optional(),
    }) as z.ZodType<UserProgrammingLanguage>,
  ),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
