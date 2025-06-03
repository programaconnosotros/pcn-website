import { z } from "zod"

export const setupSchema = z.object({
  title: z
    .string()
    .min(1, "El título es requerido")
    .max(45, "El título no puede tener más de 45 caracteres")
    .trim(),
  description: z
    .string()
    .max(250, "La descripción no puede tener más de 250 caracteres")
    .trim()
    .optional(),
  imageUrl: z
    .string()
    .url("URL de imagen inválida")
    .min(1, "La imagen es requerida"),
})

export type SetupFormData = z.infer<typeof setupSchema>
