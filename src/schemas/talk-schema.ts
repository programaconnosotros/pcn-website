import { z } from 'zod';

export const talkSchema = z
  .object({
    eventId: z.string().cuid().optional().nullable(),
    title: z
      .string()
      .min(3, { message: 'El título debe tener al menos 3 caracteres' })
      .max(200, { message: 'El título no puede exceder 200 caracteres' }),
    description: z
      .string()
      .min(10, { message: 'La descripción debe tener al menos 10 caracteres' })
      .max(2000, { message: 'La descripción no puede exceder 2000 caracteres' }),
    speakerName: z
      .string()
      .min(3, { message: 'El nombre debe tener al menos 3 caracteres' })
      .max(200, { message: 'El nombre no puede exceder 200 caracteres' }),
    speakerPhone: z
      .string()
      .min(8, { message: 'El teléfono debe tener al menos 8 dígitos' })
      .max(15, { message: 'El teléfono no puede exceder 15 dígitos' })
      .regex(/^\d+$/, {
        message:
          'El teléfono debe contener solo dígitos (sin +, espacios ni guiones). Incluí el código de país. Ej: 5493815123456',
      }),
    isProfessional: z.preprocess(
      (val) => (val === undefined || val === null ? false : val),
      z.boolean().default(false),
    ),
    jobTitle: z
      .string()
      .max(200, { message: 'El rol no puede exceder 200 caracteres' })
      .optional()
      .transform((val) => (val === '' || val === undefined ? undefined : val)),
    enterprise: z
      .string()
      .max(200, { message: 'La empresa no puede exceder 200 caracteres' })
      .optional()
      .transform((val) => (val === '' || val === undefined ? undefined : val)),
    isStudent: z.preprocess(
      (val) => (val === undefined || val === null ? false : val),
      z.boolean().default(false),
    ),
    career: z
      .string()
      .max(200, { message: 'La carrera no puede exceder 200 caracteres' })
      .optional()
      .transform((val) => (val === '' || val === undefined ? undefined : val)),
    studyPlace: z
      .string()
      .max(200, { message: 'La universidad no puede exceder 200 caracteres' })
      .optional()
      .transform((val) => (val === '' || val === undefined ? undefined : val)),
    order: z.number().int().min(0).default(0),
    portraitUrl: z
      .string()
      .url({ message: 'La URL del retrato no es válida' })
      .optional()
      .or(z.literal(''))
      .transform((val) => (val === '' ? undefined : val)),
    slidesUrl: z
      .string()
      .url({ message: 'La URL de slides no es válida' })
      .optional()
      .or(z.literal(''))
      .transform((val) => (val === '' ? undefined : val)),
    slideImages: z
      .array(z.string().url({ message: 'Cada imagen debe ser una URL válida' }))
      .default([]),
    videoUrl: z
      .string()
      .url({ message: 'La URL del video no es válida' })
      .optional()
      .or(z.literal(''))
      .transform((val) => (val === '' ? undefined : val)),
  })
  .superRefine((data, ctx) => {
    if (!data.isProfessional && !data.isStudent) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Debés seleccionar al menos una opción: profesional o estudiante',
        path: ['isProfessional'],
      });
    }

    if (data.isProfessional) {
      if (!data.jobTitle) {
        ctx.addIssue({
          code: z.ZodIssueCode.too_small,
          minimum: 1,
          type: 'string',
          inclusive: true,
          message: 'El rol es requerido para profesionales',
          path: ['jobTitle'],
        });
      }
      if (!data.enterprise) {
        ctx.addIssue({
          code: z.ZodIssueCode.too_small,
          minimum: 1,
          type: 'string',
          inclusive: true,
          message: 'La empresa es requerida para profesionales',
          path: ['enterprise'],
        });
      }
    }

    if (data.isStudent) {
      if (!data.career) {
        ctx.addIssue({
          code: z.ZodIssueCode.too_small,
          minimum: 1,
          type: 'string',
          inclusive: true,
          message: 'La carrera es requerida para estudiantes',
          path: ['career'],
        });
      }
      if (!data.studyPlace) {
        ctx.addIssue({
          code: z.ZodIssueCode.too_small,
          minimum: 1,
          type: 'string',
          inclusive: true,
          message: 'La universidad es requerida para estudiantes',
          path: ['studyPlace'],
        });
      }
    }
  });

export type TalkFormData = z.input<typeof talkSchema>;
export type TalkData = z.infer<typeof talkSchema>;
