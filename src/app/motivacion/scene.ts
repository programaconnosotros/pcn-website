import { FRASES } from './frases';

/** Cada cuánto cambian la frase y la foto. */
export const ROTATION_MS = 5 * 60_000;

/** Fotos de la comunidad, apaisadas para que llenen un monitor. */
export const PHOTOS = [
  '/FullSizeRender.webp',
  '/IMG_2330.webp',
  '/IMG_2332.webp',
  '/IMG_2338.webp',
  '/IMG_2420.webp',
  '/IMG_2886.webp',
  '/IMG_2944.webp',
  '/IMG_3083.webp',
  '/IMG_8895.webp',
  '/IMG_8962.webp',
  '/IMG_9002.webp',
];

/**
 * El turno de 5 minutos en que cae `now`. Sale del reloj y no de cuándo se abrió la página, así
 * todos ven la misma frase a la vez y recargar no la cambia.
 */
export const slotAt = (now: number) => Math.floor(now / ROTATION_MS);

const wrap = (index: number, length: number) => ((index % length) + length) % length;

export const fraseAt = (slot: number) => FRASES[wrap(slot, FRASES.length)];
export const photoAt = (slot: number) => PHOTOS[wrap(slot, PHOTOS.length)];

/** Milisegundos que le quedan al turno de `now`. */
export const remainingMs = (now: number) => ROTATION_MS - (now % ROTATION_MS);
