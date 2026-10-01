import { z } from 'zod';

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

export const projectSchema = z.object({
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
  members: z
    .array(projectMemberSchema)
    .max(30, { message: 'Podés agregar hasta 30 compañeros' })
    .default([]),
});

export type ProjectMemberFormData = z.input<typeof projectMemberSchema>;
export type ProjectMemberData = z.infer<typeof projectMemberSchema>;
export type ProjectFormData = z.input<typeof projectSchema>;
export type ProjectData = z.infer<typeof projectSchema>;
