import { z } from 'zod';

// Rol libre dentro del equipo. Vacío = sin rol.
const roleSchema = z
  .string()
  .trim()
  .max(100, { message: 'El rol no puede exceder 100 caracteres' })
  .optional()
  .nullable()
  .transform((v) => v || null);

export const MIN_PROJECT_YEAR = 1970;

// Año opcional: el formulario manda '' cuando el campo está vacío.
const yearSchema = z
  .union([z.number(), z.string()])
  .optional()
  .nullable()
  .transform((v, ctx) => {
    if (v === undefined || v === null || v === '') return null;
    const year = Number(v);
    const maxYear = new Date().getFullYear() + 1;
    if (!Number.isInteger(year) || year < MIN_PROJECT_YEAR || year > maxYear) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Ingresá un año entre ${MIN_PROJECT_YEAR} y ${maxYear}`,
      });
      return z.NEVER;
    }
    return year;
  });

export const projectMemberSchema = z.object({
  userId: z
    .string()
    .cuid()
    .optional()
    .nullable()
    .transform((v) => (v === '' ? null : v ?? null)),
  memberName: z
    .string()
    .min(2, { message: 'El nombre debe tener al menos 2 caracteres' })
    .max(200, { message: 'El nombre no puede exceder 200 caracteres' }),
  role: roleSchema,
});

const isGitHubRepoUrl = (value: string) => {
  try {
    const { protocol, hostname, pathname } = new URL(value);
    return (
      protocol === 'https:' &&
      ['github.com', 'www.github.com'].includes(hostname) &&
      pathname.split('/').filter(Boolean).length >= 2
    );
  } catch {
    return false;
  }
};

export const projectSchema = z
  .object({
    title: z
      .string()
      .min(3, { message: 'El título debe tener al menos 3 caracteres' })
      .max(200, { message: 'El título no puede exceder 200 caracteres' }),
    description: z
      .string()
      .min(10, { message: 'La descripción debe tener al menos 10 caracteres' })
      .max(2000, { message: 'La descripción no puede exceder 2000 caracteres' }),
    url: z.string().url({ message: 'La URL del proyecto no es válida' }),
    logoUrl: z
      .string()
      .url({ message: 'La URL del logo no es válida' })
      .optional()
      .or(z.literal(''))
      .transform((val) => (val === '' ? undefined : val)),
    techStack: z.array(z.string().min(1).max(50)).default([]),
    isOpenSource: z.boolean().default(false),
    repoUrl: z
      .string()
      .trim()
      .refine((val) => val === '' || isGitHubRepoUrl(val), {
        message: 'Ingresá la URL de un repositorio de GitHub (https://github.com/usuario/repo)',
      })
      .optional()
      .transform((val) => (val ? val : undefined)),
    startYear: yearSchema,
    endYear: yearSchema,
    authorRole: roleSchema,
    members: z
      .array(projectMemberSchema)
      .max(30, { message: 'Podés agregar hasta 30 compañeros' })
      .default([]),
  })
  .refine((data) => !data.startYear || !data.endYear || data.endYear >= data.startYear, {
    message: 'El año de cierre no puede ser anterior al de inicio',
    path: ['endYear'],
  });

export type ProjectMemberFormData = z.input<typeof projectMemberSchema>;
export type ProjectMemberData = z.infer<typeof projectMemberSchema>;
export type ProjectFormData = z.input<typeof projectSchema>;
export type ProjectData = z.infer<typeof projectSchema>;
