import { z } from 'zod';

const ARGENTINA_PROVINCES = [
  'Buenos Aires',
  'Catamarca',
  'Chaco',
  'Chubut',
  'Córdoba',
  'Corrientes',
  'Entre Ríos',
  'Formosa',
  'Jujuy',
  'La Pampa',
  'La Rioja',
  'Mendoza',
  'Misiones',
  'Neuquén',
  'Río Negro',
  'Salta',
  'San Juan',
  'San Luis',
  'Santa Cruz',
  'Santa Fe',
  'Santiago del Estero',
  'Tierra del Fuego',
  'Tucumán',
] as const;

// Schema base sin refines (para poder extenderlo)
/**
 * Reglas para una contraseña nueva (registro y reseteo). El tope de 72 es el largo máximo que
 * bcrypt tiene en cuenta: más allá, el resto se ignoraría sin avisar.
 */
export const newPasswordSchema = z
  .string({ required_error: 'Campo obligatorio' })
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .max(72, 'La contraseña no puede tener más de 72 caracteres');

const signUpSchemaBaseObject = z.object({
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
  password: newPasswordSchema,
  confirmPassword: z.string(),
  phoneNumber: z.string().optional(),
  country: z.string().min(1, 'El país es requerido'),
  province: z.string().optional(),
  profession: z.string().optional(),
  enterprise: z.string().optional(),
  studyField: z.string().optional(),
  studyPlace: z.string().optional(),
  image: z.string().optional(),
});

// Schema base con validación condicional de provincia
export const signUpSchemaBase = signUpSchemaBaseObject.refine(
  (data) => {
    // Si el país es Argentina, la provincia es requerida
    if (
      data.country === 'Argentina' &&
      (!data.province || data.province.trim().length === 0 || data.province === '')
    ) {
      return false;
    }
    return true;
  },
  {
    message: 'La provincia es requerida si el país es Argentina',
    path: ['province'],
  },
);

// Schema completo con validación de contraseñas
export const signUpSchema = signUpSchemaBase.refine(
  (data) => data.password === data.confirmPassword,
  {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  },
);

// Schema para la acción sign-up que incluye redirectTo
export const signUpActionSchema = signUpSchemaBaseObject
  .extend({
    redirectTo: z.string().optional(),
  })
  .refine(
    (data) => {
      if (
        data.country === 'Argentina' &&
        (!data.province || data.province.trim().length === 0 || data.province === '')
      ) {
        return false;
      }
      return true;
    },
    {
      message: 'La provincia es requerida si el país es Argentina',
      path: ['province'],
    },
  )
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export { ARGENTINA_PROVINCES };
