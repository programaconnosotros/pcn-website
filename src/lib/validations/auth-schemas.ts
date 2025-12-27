import { z } from 'zod';

// Schema base sin refine (para poder extenderlo)
export const signUpSchemaBase = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede tener más de 100 caracteres')
    .regex(
      /^[a-zA-ZÀ-ÿ\s]+$/,
      'El nombre solo puede contener letras (a-z, A-Z) y espacios. No se permiten números ni caracteres especiales',
    ),
  email: z.string().email('Correo electrónico inválido'),
  password: z
    .string({ required_error: 'Campo obligatorio' })
    .min(8, 'La contraseña debe tener al menos 8 caracteres'),
  confirmPassword: z.string(),
});

// Schema completo con validación de contraseñas
export const signUpSchema = signUpSchemaBase.refine(
  (data) => data.password === data.confirmPassword,
  {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  },
);

// Podemos agregar más esquemas relacionados aquí
// Por ejemplo:
// export const signInSchema = z.object({ ... });
// export const resetPasswordSchema = z.object({ ... });
