import { timingSafeEqual } from 'node:crypto';

type HeaderReader = Pick<Headers, 'get'>;

/**
 * Header que CloudFront agrega a cada request hacia el servidor, con el valor de
 * `CLOUDFRONT_ORIGIN_SECRET`. Prueba que el request pasó por CloudFront y no le pegó directo al
 * servidor, así que recién ahí se puede confiar en `cloudfront-viewer-address`.
 */
export const CLOUDFRONT_ORIGIN_SECRET_HEADER = 'x-origin-verify';

const sameSecret = (received: string, expected: string) => {
  const a = Buffer.from(received);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
};

/** IP de `cloudfront-viewer-address` ("ip:puerto", también en IPv6), solo si vino de CloudFront. */
const cloudFrontViewerIp = (headerStore: HeaderReader) => {
  const secret = process.env.CLOUDFRONT_ORIGIN_SECRET;
  const received = headerStore.get(CLOUDFRONT_ORIGIN_SECRET_HEADER);
  if (!secret || !received || !sameSecret(received, secret)) return null;
  const address = headerStore.get('cloudfront-viewer-address')?.trim();
  if (!address) return null;
  const portSeparator = address.lastIndexOf(':');
  return portSeparator > 0 ? address.slice(0, portSeparator) : address;
};

/**
 * IP real de quien hace el request.
 *
 * - Detrás de CloudFront, kamal-proxy solo ve la IP del edge de CloudFront, así que se usa la que
 *   CloudFront manda en `cloudfront-viewer-address`.
 * - Sin CloudFront, se toma la última entrada de `x-forwarded-for`, la que agrega kamal-proxy con
 *   la IP de la conexión: las anteriores las puede escribir el cliente, y confiar en ellas
 *   permitiría esquivar los rate limits cambiando el header en cada intento.
 */
export const clientIpFrom = (headerStore: HeaderReader): string | null =>
  cloudFrontViewerIp(headerStore) ||
  headerStore.get('x-forwarded-for')?.split(',').at(-1)?.trim() ||
  headerStore.get('x-real-ip') ||
  null;
