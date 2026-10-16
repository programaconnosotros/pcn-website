import { z } from 'zod';
import { isGoogleMapsUrl } from '@/lib/google-maps';

// Un lugar para laburar de /lugares: dónde queda, qué tal es para trabajar (de 1 a 5) y una foto
// opcional.

const rating = z
  .number({ message: 'Elegí un puntaje' })
  .int()
  .min(1, { message: 'Elegí un puntaje' })
  .max(5, { message: 'El puntaje va de 1 a 5' });

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, { message: `Máximo ${max} caracteres` })
    .nullish()
    .transform((value) => value || null);

export const workPlaceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: 'Poné el nombre del lugar' })
    .max(100, { message: 'Máximo 100 caracteres' }),
  city: z
    .string()
    .trim()
    .min(2, { message: 'Poné la ciudad' })
    .max(100, { message: 'Máximo 100 caracteres' }),
  address: optionalText(200),
  googleMapsUrl: optionalText(500).refine((url) => url === null || isGoogleMapsUrl(url), {
    message: 'Tiene que ser un link de Google Maps',
  }),
  wifi: rating,
  plugs: rating,
  calls: rating,
  // Sin comida, los dos quedan vacíos.
  foodQuality: rating.nullable(),
  foodVariety: rating.nullable(),
  notes: optionalText(1000),
  photoUrl: optionalText(2048).refine((url) => url === null || url.startsWith('https://'), {
    message: 'La foto tiene que ser una URL https',
  }),
});

export type WorkPlaceInput = z.input<typeof workPlaceSchema>;
export type WorkPlaceData = z.output<typeof workPlaceSchema>;

/** What each 1–5 score measures, in the order the page shows them. */
export const WORK_PLACE_RATINGS = [
  { key: 'wifi', label: 'wifi' },
  { key: 'plugs', label: 'enchufes' },
  { key: 'calls', label: 'para llamadas' },
  { key: 'foodQuality', label: 'comida' },
  { key: 'foodVariety', label: 'variedad' },
] as const;
