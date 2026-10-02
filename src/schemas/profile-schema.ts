import { z } from 'zod';
import { UserProgrammingLanguage } from '@/types/programming-language';

// Helper para validar URLs opcionales (permite string vacío o URL válida)
const optionalUrl = z
  .string()
  .optional()
  .nullable()
  .transform((val) => (val === '' || val === undefined ? null : val))
  .refine(
    (val) => {
      if (val === null || val === undefined) return true;
      try {
        new URL(val);
        return true;
      } catch {
        return false;
      }
    },
    { message: 'La URL debe ser válida' },
  );

export const profileSchema = z.object({
  name: z.string().min(3, { message: 'El nombre debe tener al menos 3 caracteres' }),
  email: z.string().email({ message: 'El email debe ser válido' }),
  phoneNumber: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  countryOfOrigin: z.string().optional().nullable(),
  province: z.string().optional().nullable(),
  xAccountUrl: optionalUrl,
  linkedinUrl: optionalUrl,
  gitHubUrl: optionalUrl,
  instagramUrl: optionalUrl,
  youtubeUrl: optionalUrl,
  twitchUrl: optionalUrl,
  kickUrl: optionalUrl,
  slogan: z.string().optional().nullable(),
  // Puestos actuales, en orden. Las filas sin cargo se descartan al guardar.
  positions: z
    .array(
      z.object({
        jobTitle: z.string().trim().max(80, { message: 'Máximo 80 caracteres' }),
        enterprise: z.string().trim().max(80, { message: 'Máximo 80 caracteres' }),
      }),
    )
    .max(5, { message: 'Podés cargar hasta 5 puestos' }),
  career: z.string().optional().nullable(),
  studyPlace: z.string().optional().nullable(),
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
