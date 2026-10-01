import { getSignedUrl } from '@aws-sdk/cloudfront-signer';
import { CLOUDFRONT_URL } from '@/lib/s3';

const KEY_PAIR_ID = process.env.AWS_CLOUDFRONT_KEY_PAIR_ID || '';
// PEM en base64 para que entre en una sola línea de las variables de entorno.
const PRIVATE_KEY = process.env.AWS_CLOUDFRONT_PRIVATE_KEY_BASE64
  ? Buffer.from(process.env.AWS_CLOUDFRONT_PRIVATE_KEY_BASE64, 'base64').toString('utf8')
  : '';

const HOUR_MS = 60 * 60 * 1000;

/** Las fotos subidas a la galería: CloudFront solo las sirve con una URL firmada. */
export const isSignedGallerySrc = (src: string) =>
  !!CLOUDFRONT_URL && src.startsWith(`${CLOUDFRONT_URL}/gallery/`);

/**
 * Firma la URL de CloudFront de una foto de la galería. Vence al final de la hora siguiente,
 * así la misma foto tiene la misma URL durante una hora y el navegador y CloudFront la
 * cachean. Las fotos que viven en /public se devuelven tal cual.
 */
export function signGallerySrc(src: string, now = Date.now()) {
  const expiresAt = new Date(Math.ceil(now / HOUR_MS) * HOUR_MS + HOUR_MS);
  if (!isSignedGallerySrc(src)) return { url: src, expiresAt };
  if (!KEY_PAIR_ID || !PRIVATE_KEY) throw new Error('Falta configurar la firma de CloudFront');

  const url = getSignedUrl({
    url: src,
    keyPairId: KEY_PAIR_ID,
    privateKey: PRIVATE_KEY,
    dateLessThan: expiresAt.toISOString(),
  });
  return { url, expiresAt };
}

/**
 * Las URLs firmadas de la miniatura y del archivo completo de un ítem, para ponerlas directo
 * en la página en vez de pasar por un redirect.
 */
export const signGalleryItem = <T extends { src: string; thumbSrc: string }>(item: T) => ({
  ...item,
  thumbUrl: signGallerySrc(item.thumbSrc).url,
  fullUrl: signGallerySrc(item.src).url,
});
