import { z } from 'zod';

export const talkProposalSchema = z
  .object({
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
      .regex(/^\d+$/, { message: 'El teléfono debe contener solo dígitos (sin +, espacios ni guiones). Incluí el código de país. Ej: 5493815123456' }),
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

export type TalkProposalFormData = z.input<typeof talkProposalSchema>;
export type TalkProposalData = z.infer<typeof talkProposalSchema>;
