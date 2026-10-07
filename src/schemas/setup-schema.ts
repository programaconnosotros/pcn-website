import { z } from 'zod';

/**
 * Hoy como `YYYY-MM-DD` en la zona horaria local, para el valor de un `<input type="date">`.
 * `slackDays` deja margen al validar en el servidor, que puede ir un día adelantado.
 */
export const todayInputValue = (slackDays = 0) => {
  const now = new Date(Date.now() + slackDays * 86_400_000);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

/** Un `Date` de Prisma guardado como `@db.Date` (medianoche UTC) como `YYYY-MM-DD`. */
export const dateInputValue = (date: Date) => date.toISOString().slice(0, 10);

/**
 * Un `@db.Date` (medianoche UTC) como fecha local del mismo día, para formatearlo sin que la
 * zona horaria lo corra al día anterior.
 */
export const calendarDate = (date: Date) =>
  new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());

export const setupSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, { message: 'El título tiene que tener al menos 3 caracteres' })
    .max(80, { message: 'El título puede tener 80 caracteres como máximo' }),
  description: z
    .string()
    .trim()
    .min(10, { message: 'Contá un poco más: al menos 10 caracteres' })
    .max(1500, { message: 'La descripción puede tener 1500 caracteres como máximo' }),
  /** Día del setup, `YYYY-MM-DD`. Puede ser de antes (una foto vieja) pero no del futuro. */
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Elegí una fecha válida' })
    .refine((value) => !Number.isNaN(Date.parse(value)), { message: 'Elegí una fecha válida' })
    .refine((value) => value <= todayInputValue(1), {
      message: 'La fecha no puede ser del futuro',
    }),
});

export type SetupFormData = z.infer<typeof setupSchema>;

/** Formatos de foto que se aceptan; sharp los pasa todos a webp. */
export const SETUP_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

/** Tope del original; S3 rechaza lo que pase de acá. */
export const SETUP_MAX_BYTES = 10 * 1024 * 1024;
