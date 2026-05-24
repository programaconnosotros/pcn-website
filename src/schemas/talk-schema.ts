import { z } from 'zod';

const optionalTextSchema = (fieldName: string) =>
  z
    .string()
    .max(200, { message: `${fieldName} no puede exceder 200 caracteres` })
    .optional()
    .or(z.literal(''))
    .transform((val) => {
      const trimmed = val?.trim();
      return trimmed ? trimmed : undefined;
    });

const isValidDateInput = (val: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(val)) return false;
  const [year, month, day] = val.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 12));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
};

const dateInputSchema = z
  .string()
  .optional()
  .or(z.literal(''))
  .refine((val) => !val || isValidDateInput(val), {
    message: 'La fecha del evento no es válida',
  })
  .transform((val) => (val ? new Date(`${val}T12:00:00.000Z`) : undefined));

export const talkSpeakerSchema = z
  .object({
    userId: z
      .string()
      .cuid()
      .optional()
      .nullable()
      .transform((v) => (v === '' ? null : v ?? null)),
    speakerName: z
      .string()
      .min(3, { message: 'El nombre debe tener al menos 3 caracteres' })
      .max(200, { message: 'El nombre no puede exceder 200 caracteres' }),
    speakerPhone: z.string().default(''),
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

export const talkSchema = z.object({
  eventId: z.string().cuid().optional().nullable(),
  manualEventTitle: optionalTextSchema('El título del evento'),
  manualEventDate: dateInputSchema,
  manualEventLocation: optionalTextSchema('La ubicación del evento'),
  title: z
    .string()
    .min(3, { message: 'El título debe tener al menos 3 caracteres' })
    .max(200, { message: 'El título no puede exceder 200 caracteres' }),
  description: z
    .string()
    .min(10, { message: 'La descripción debe tener al menos 10 caracteres' })
    .max(2000, { message: 'La descripción no puede exceder 2000 caracteres' }),
  speakers: z.array(talkSpeakerSchema).min(1, { message: 'Agregá al menos un orador' }),
  order: z.number().int().min(0).default(0),
  portraitUrl: z
    .string()
    .url({ message: 'La URL de la foto no es válida' })
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
});

export type TalkSpeakerFormData = z.input<typeof talkSpeakerSchema>;
export type TalkSpeakerData = z.infer<typeof talkSpeakerSchema>;
export type TalkFormData = z.input<typeof talkSchema>;
export type TalkData = z.infer<typeof talkSchema>;
