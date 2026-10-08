import { cookies, headers } from 'next/headers';
import { clientIpFrom } from '@/lib/client-ip';
import { rateLimitDigest } from '@/lib/rate-limit-messages';
import { findSession } from '@/lib/session';
import { alertRateLimitHit } from '@/lib/security-alerts';

type RateLimitRule = { limit: number; windowSeconds: number };

/**
 * Límites por formulario. Cada uno cuenta envíos por usuario logueado (o por IP si es anónimo)
 * dentro de una ventana deslizante. Los admins no tienen límite.
 */
export const RATE_LIMITS = {
  signIn: { limit: 20, windowSeconds: 15 * 60 },
  signUp: { limit: 5, windowSeconds: 60 * 60 },
  sendCode: { limit: 5, windowSeconds: 15 * 60 },
  verifyCode: { limit: 10, windowSeconds: 15 * 60 },
  createContent: { limit: 10, windowSeconds: 60 * 60 },
  comment: { limit: 20, windowSeconds: 10 * 60 },
  editContent: { limit: 30, windowSeconds: 10 * 60 },
  eventRegistration: { limit: 20, windowSeconds: 10 * 60 },
  // Mails to everyone signed up for an event: a handful an hour is plenty.
  eventBroadcast: { limit: 5, windowSeconds: 60 * 60 },
  upload: { limit: 20, windowSeconds: 10 * 60 },
  photoDownload: { limit: 30, windowSeconds: 60 * 60 },
  log: { limit: 60, windowSeconds: 10 * 60 },
  pageVisit: { limit: 300, windowSeconds: 10 * 60 },
  // Each run of an AI agent (talk from its photo, event from its flyers) is a paid model call.
  aiAgent: { limit: 30, windowSeconds: 60 * 60 },
} satisfies Record<string, RateLimitRule>;

export type RateLimitName = keyof typeof RATE_LIMITS;

// El sitio corre en un único proceso (Kamal, un solo server), así que alcanza con memoria.
const hits = new Map<string, number[]>();

/**
 * Registra un intento para `key` y devuelve los segundos que faltan para poder reintentar
 * (0 si el intento está permitido).
 */
export const consumeRateLimit = (key: string, { limit, windowSeconds }: RateLimitRule): number => {
  const now = Date.now();
  const windowStart = now - windowSeconds * 1000;
  const recent = (hits.get(key) ?? []).filter((time) => time > windowStart);

  if (recent.length >= limit) {
    hits.set(key, recent);
    return Math.max(1, Math.ceil((recent[0] + windowSeconds * 1000 - now) / 1000));
  }

  recent.push(now);
  hits.set(key, recent);
  return 0;
};

export const resetRateLimits = () => hits.clear();

/** IP de quien hace el request (ver `clientIpFrom`), para contar los envíos de anónimos. */
export const getClientIp = async () => clientIpFrom(await headers()) ?? 'unknown';

/**
 * Segundos que quien envía (usuario logueado, o IP si es anónimo) tiene que esperar para volver a
 * usar el formulario `name`, registrando el intento si está permitido (0). Los admins no tienen
 * límite. Sirve para las actions que devuelven el error en vez de lanzarlo: en producción Next
 * no le pasa al navegador el mensaje de un error lanzado, así que un `RATE_LIMIT:<segundos>`
 * lanzado llega como un error genérico.
 */
export const getRateLimitWait = async (name: RateLimitName) => {
  const sessionId = (await cookies()).get('sessionId')?.value;
  const session = sessionId ? await findSession(sessionId) : null;

  if (session?.user.role === 'ADMIN') return 0;

  const identity = session ? `user:${session.user.id}` : `ip:${await getClientIp()}`;
  const wait = consumeRateLimit(`${name}:${identity}`, RATE_LIMITS[name]);
  if (wait > 0) await alertRateLimitHit(name, identity);
  return wait;
};

/**
 * Error de rate limit. Lleva el formulario y la espera en el `digest`, que Next respeta y manda
 * al navegador también en producción (el mensaje de un error lanzado no llega). La UI lo
 * convierte en un aviso claro con `getRateLimitMessage` de `@/lib/rate-limit-messages`.
 */
export class RateLimitError extends Error {
  readonly digest: string;

  constructor(
    readonly limit: RateLimitName,
    readonly waitSeconds: number,
  ) {
    const digest = rateLimitDigest(limit, waitSeconds);
    super(digest);
    this.name = 'RateLimitError';
    this.digest = digest;
  }
}

/**
 * Para server actions de formularios: lanza un `RateLimitError` si quien envía superó el límite.
 * Los admins pasan siempre.
 */
export const enforceRateLimit = async (name: RateLimitName) => {
  const waitSeconds = await getRateLimitWait(name);

  if (waitSeconds > 0) {
    throw new RateLimitError(name, waitSeconds);
  }
};
