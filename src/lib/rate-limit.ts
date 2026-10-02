import { cookies, headers } from 'next/headers';
import prisma from '@/lib/prisma';

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
  upload: { limit: 20, windowSeconds: 10 * 60 },
  photoDownload: { limit: 30, windowSeconds: 60 * 60 },
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

/**
 * IP de quien hace el request. Se toma la última entrada de `x-forwarded-for`, la que agrega
 * kamal-proxy con la IP real de la conexión: las anteriores las puede escribir el cliente, y
 * confiar en ellas permitiría esquivar el límite cambiando el header en cada intento.
 */
export const getClientIp = async () => {
  const headerStore = await headers();
  return (
    headerStore.get('x-forwarded-for')?.split(',').at(-1)?.trim() ||
    headerStore.get('x-real-ip') ||
    'unknown'
  );
};

/**
 * Para server actions de formularios: lanza `RATE_LIMIT:<segundos>` si quien envía (usuario
 * logueado, o IP si es anónimo) superó el límite. Los admins pasan siempre.
 */
export const enforceRateLimit = async (name: RateLimitName) => {
  const sessionId = (await cookies()).get('sessionId')?.value;
  const session = sessionId
    ? await prisma.session.findUnique({
        where: { id: sessionId },
        select: { user: { select: { id: true, role: true } } },
      })
    : null;

  if (session?.user.role === 'ADMIN') return;

  const identity = session ? `user:${session.user.id}` : `ip:${await getClientIp()}`;
  const waitSeconds = consumeRateLimit(`${name}:${identity}`, RATE_LIMITS[name]);

  if (waitSeconds > 0) {
    throw new Error(`RATE_LIMIT:${waitSeconds}`);
  }
};
