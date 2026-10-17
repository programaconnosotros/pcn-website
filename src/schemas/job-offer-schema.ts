import { z } from 'zod';

// Una oferta de /empleos: qué puesto, en qué empresa, cómo se trabaja y dónde postularse.

export const JOB_TYPES = {
  'full-time': 'full-time',
  'part-time': 'part-time',
  freelance: 'freelance',
  pasantia: 'pasantía',
} as const;

export const JOB_MODALITIES = {
  remoto: 'remoto',
  hibrido: 'híbrido',
  presencial: 'presencial',
} as const;

export const JOB_SENIORITIES = {
  trainee: 'trainee',
  junior: 'junior',
  'semi-senior': 'semi senior',
  senior: 'senior',
  lead: 'lead',
} as const;

const keys = <T extends Record<string, string>>(record: T) =>
  Object.keys(record) as [keyof T & string, ...(keyof T & string)[]];

const isEmail = (value: string) => z.string().email().safeParse(value).success;

export const jobOfferSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, { message: 'Poné el puesto' })
    .max(100, { message: 'Máximo 100 caracteres' }),
  company: z
    .string()
    .trim()
    .min(2, { message: 'Poné la empresa' })
    .max(100, { message: 'Máximo 100 caracteres' }),
  location: z
    .string()
    .trim()
    .min(2, { message: 'Poné dónde es (o "Remoto")' })
    .max(100, { message: 'Máximo 100 caracteres' }),
  type: z.enum(keys(JOB_TYPES), { message: 'Elegí la jornada' }),
  modality: z.enum(keys(JOB_MODALITIES), { message: 'Elegí la modalidad' }),
  seniority: z
    .enum(keys(JOB_SENIORITIES))
    .nullish()
    .transform((value) => value ?? null),
  description: z
    .string()
    .trim()
    .min(20, { message: 'Contá un poco más del puesto (20 caracteres o más)' })
    .max(3000, { message: 'Máximo 3000 caracteres' }),
  tags: z
    .array(z.string().trim().min(1).max(30))
    .max(8, { message: 'Hasta 8 tecnologías' })
    .transform((tags) => [...new Set(tags)]),
  applyUrl: z
    .string()
    .trim()
    .max(500, { message: 'Máximo 500 caracteres' })
    .refine((value) => value.startsWith('https://') || isEmail(value), {
      message: 'Poné un link https o un email para postularse',
    }),
});

export type JobOfferInput = z.input<typeof jobOfferSchema>;
export type JobOfferData = z.output<typeof jobOfferSchema>;

/** Where the "postularme" button goes: the link itself or a mail to the address. */
export const applyHref = (applyUrl: string) =>
  applyUrl.startsWith('https://') ? applyUrl : `mailto:${applyUrl}`;
