import { z } from 'zod';
import { UserProgrammingLanguage } from '@/types/programming-language';
import { MAX_USER_SPECIALTIES, isSpecialtyId } from '@/components/especialidades/specialties';

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

// Textos libres con tope: el perfil se guarda tal cual llega, y sin tope cualquiera podría guardar
// megas en un campo que después se muestra en todas partes.
const optionalText = (max: number) =>
  z
    .string()
    .max(max, { message: `Máximo ${max} caracteres` })
    .optional()
    .nullable();

export const profileSchema = z.object({
  name: z
    .string()
    .min(3, { message: 'El nombre debe tener al menos 3 caracteres' })
    .max(100, { message: 'Máximo 100 caracteres' }),
  email: z.string().email({ message: 'El email debe ser válido' }),
  phoneNumber: optionalText(30),
  // La foto que se sube al bucket (o la que ya tenía): solo una URL https, nunca otro esquema.
  image: z
    .string()
    .max(2048)
    .refine((value) => value === '' || value.startsWith('https://'), {
      message: 'La imagen debe ser una URL https',
    })
    .optional()
    .nullable(),
  countryOfOrigin: optionalText(100),
  province: optionalText(100),
  xAccountUrl: optionalUrl,
  linkedinUrl: optionalUrl,
  gitHubUrl: optionalUrl,
  instagramUrl: optionalUrl,
  youtubeUrl: optionalUrl,
  twitchUrl: optionalUrl,
  kickUrl: optionalUrl,
  slogan: optionalText(500),
  // Puestos actuales, en orden. Las filas sin cargo se descartan al guardar.
  positions: z
    .array(
      z.object({
        jobTitle: z.string().trim().max(80, { message: 'Máximo 80 caracteres' }),
        enterprise: z.string().trim().max(80, { message: 'Máximo 80 caracteres' }),
      }),
    )
    .max(5, { message: 'Podés cargar hasta 5 puestos' }),
  career: optionalText(150),
  studyPlace: optionalText(150),
  // Ids de /especialidades en las que la persona se considera especialista.
  specialties: z
    .array(z.string().refine(isSpecialtyId, { message: 'Especialidad inválida' }))
    .max(MAX_USER_SPECIALTIES, {
      message: `Podés marcar hasta ${MAX_USER_SPECIALTIES} especialidades`,
    })
    .default([]),
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
/** What the action accepts: fields with a default (like `specialties`) may be left out. */
export type ProfileInput = z.input<typeof profileSchema>;
