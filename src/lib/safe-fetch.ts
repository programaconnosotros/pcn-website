import { lookup as dnsLookup, type LookupAddress } from 'node:dns';
import http from 'node:http';
import https from 'node:https';
import { isIP, type LookupFunction } from 'node:net';

// Pedidos del servidor a URLs que eligió un usuario (la web de un proyecto, la foto de un perfil).
// Sin cuidado, alguien podría apuntarlas a la red interna (SSRF): la metadata de EC2 en
// 169.254.169.254, Postgres, kamal-proxy. Acá la IP se valida en el momento de conectar, con la
// misma resolución DNS que usa el socket, así que un dominio que primero resuelve a una IP pública
// y después a una privada (DNS rebinding) tampoco pasa. Cada redirect se vuelve a validar.

/** Loopback, privadas, link-local (metadata de la nube), CGNAT, multicast y no especificadas. */
export const isPrivateAddress = (address: string): boolean => {
  if (isIP(address) === 6) {
    const lower = address.toLowerCase();
    if (lower.startsWith('::ffff:')) return isPrivateAddress(lower.slice(7));
    return (
      lower === '::' ||
      lower === '::1' ||
      lower.startsWith('fc') ||
      lower.startsWith('fd') ||
      lower.startsWith('fe80') ||
      lower.startsWith('ff')
    );
  }
  const [a, b] = address.split('.').map(Number);
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    a >= 224
  );
};

export class BlockedAddressError extends Error {
  constructor(host: string) {
    super(`${host} apunta a una dirección interna`);
  }
}

type SafeFetchOptions = {
  maxRedirects?: number;
  timeoutMs?: number;
  /** Bytes del body a leer como máximo; 0 no lo lee (alcanza con los headers). */
  maxBytes?: number;
  headers?: Record<string, string>;
};

export type SafeResponse = {
  status: number;
  ok: boolean;
  headers: Headers;
  /** El body, si se pidió con `maxBytes` y no lo superó. */
  body: Buffer | null;
  url: string;
};

const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

/**
 * `safeFetch` con otra regla de qué IPs se permiten: los tests la usan para hablar con un server
 * local en 127.0.0.1. La app usa siempre `safeFetch`.
 */
export const createSafeFetch = (isBlocked: (_address: string) => boolean) => {
  const safeLookup: LookupFunction = (hostname, options, callback) => {
    dnsLookup(hostname, { ...options, all: true }, (error, addresses: LookupAddress[]) => {
      if (error) return callback(error, '', 0);
      if (!addresses.length || addresses.some(({ address }) => isBlocked(address))) {
        return callback(new BlockedAddressError(hostname), '', 0);
      }
      if (options.all) {
        return (callback as unknown as (_error: null, _all: LookupAddress[]) => void)(
          null,
          addresses,
        );
      }
      return callback(null, addresses[0].address, addresses[0].family);
    });
  };

  const requestOnce = (url: URL, options: Required<SafeFetchOptions>) =>
    new Promise<Omit<SafeResponse, 'url'> & { location: string | null }>((resolve, reject) => {
      const host = url.hostname.replace(/^\[|\]$/g, '');
      // Una IP escrita en la URL no pasa por el lookup: se valida acá
      if (isIP(host) && isBlocked(host)) return reject(new BlockedAddressError(host));

      const client = url.protocol === 'https:' ? https : http;
      const request = client.get(
        url,
        {
          lookup: safeLookup,
          timeout: options.timeoutMs,
          headers: {
            'User-Agent': USER_AGENT,
            Accept: 'text/html,application/xhtml+xml,image/*;q=0.9,*/*;q=0.8',
            ...options.headers,
          },
        },
        (response) => {
          const status = response.statusCode ?? 0;
          const headers = new Headers();
          for (const [key, value] of Object.entries(response.headers)) {
            if (value !== undefined)
              headers.set(key, Array.isArray(value) ? value.join(', ') : value);
          }
          const result = { status, ok: status >= 200 && status < 300, headers };
          const location = status >= 300 && status < 400 ? headers.get('location') : null;

          if (!options.maxBytes || location || !result.ok) {
            response.destroy();
            return resolve({ ...result, body: null, location });
          }

          const declared = Number(headers.get('content-length'));
          if (declared > options.maxBytes) {
            response.destroy();
            return resolve({ ...result, body: null, location });
          }
          const chunks: Buffer[] = [];
          let size = 0;
          response.on('data', (chunk: Buffer) => {
            size += chunk.length;
            if (size > options.maxBytes) {
              response.destroy();
              resolve({ ...result, body: null, location });
            } else {
              chunks.push(chunk);
            }
          });
          response.on('end', () => resolve({ ...result, body: Buffer.concat(chunks), location }));
          response.on('error', reject);
        },
      );
      request.on('timeout', () => request.destroy(new Error('timeout')));
      request.on('error', reject);
    });

  /**
   * GET a una URL elegida por un usuario, solo http(s) y solo a direcciones públicas, siguiendo
   * hasta `maxRedirects` redirects. Rechaza (lanza) si algún salto apunta a la red interna.
   */
  return async (rawUrl: string, options: SafeFetchOptions = {}): Promise<SafeResponse> => {
    const resolved: Required<SafeFetchOptions> = {
      maxRedirects: 3,
      timeoutMs: 10_000,
      maxBytes: 0,
      headers: {},
      ...options,
    };
    let url = new URL(rawUrl);
    for (let hop = 0; ; hop++) {
      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        throw new Error(`Protocolo no permitido: ${url.protocol}`);
      }
      const { location, ...response } = await requestOnce(url, resolved);
      if (!location) return { ...response, url: url.toString() };
      if (hop >= resolved.maxRedirects) throw new Error('Demasiados redirects');
      url = new URL(location, url);
    }
  };
};

export const safeFetch = createSafeFetch(isPrivateAddress);
