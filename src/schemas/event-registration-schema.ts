import { z } from 'zod';

export const eventRegistrationSchema = z
  .object({
    firstName: z
      .string()
      .min(2, { message: 'El nombre debe tener al menos 2 caracteres' })
      .max(100, { message: 'El nombre no puede exceder 100 caracteres' }),
    lastName: z
      .string()
      .min(2, { message: 'El apellido debe tener al menos 2 caracteres' })
      .max(100, { message: 'El apellido no puede exceder 100 caracteres' }),
    email: z.string().email({ message: 'Debe ser un email válido' }),
    type: z.enum(['STUDENT', 'PROFESSIONAL'], {
      required_error: 'Debes seleccionar si eres estudiante o profesional',
    }),
    workTitle: z.string().optional(),
    workPlace: z.string().optional(),
    studyField: z.string().optional(),
    studyPlace: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.type === 'PROFESSIONAL') {
        return (
          data.workTitle &&
          data.workTitle.trim().length > 0 &&
          data.workPlace &&
          data.workPlace.trim().length > 0
        );
      }
      return true;
    },
    {
      message: 'Debes completar de qué y dónde trabajas',
      path: ['workTitle'],
    },
  )
  .refine(
    (data) => {
      if (data.type === 'STUDENT') {
        return (
          data.studyField &&
          data.studyField.trim().length > 0 &&
          data.studyPlace &&
          data.studyPlace.trim().length > 0
        );
      }
      return true;
    },
    {
      message: 'Debes completar qué y dónde estudias',
      path: ['studyField'],
    },
  );

export type EventRegistrationFormData = z.infer<typeof eventRegistrationSchema>;

