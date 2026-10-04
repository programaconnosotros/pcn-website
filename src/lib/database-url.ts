import { availableParallelism } from 'node:os';
import type { PrismaPg } from '@prisma/adapter-pg';

type PoolConfig = Exclude<ConstructorParameters<typeof PrismaPg>[0], string | { query: unknown }>;

// Parámetros que entendía el engine de Prisma 6 y que pg no conoce o interpreta distinto.
const PRISMA_PARAMS = [
  'sslmode',
  'sslaccept',
  'connection_limit',
  'pool_timeout',
  'connect_timeout',
  'socket_timeout',
  'pgbouncer',
  'statement_cache_size',
  'schema',
];

const isLocalHost = (host: string) =>
  ['localhost', '127.0.0.1', '[::1]'].includes(host) || !host.includes('.');

/**
 * La configuración del pool de pg para `DATABASE_URL`, con el mismo comportamiento que tenía
 * Prisma 6 con la misma URL. Prisma 7 se conecta con el adapter de pg, que lee la URL a su
 * manera: con `sslmode=require` exige un certificado verificable (el del pooler de Supabase no lo
 * es para Node), sin `sslmode` no usa TLS e ignora `connection_limit` y `pool_timeout`.
 *
 * - TLS: `sslmode=disable` lo apaga y `require`/`prefer` lo prenden sin verificar el certificado,
 *   salvo `sslaccept=strict`, como hacía Prisma. Sin `sslmode` (Prisma 6 intentaba TLS y si el
 *   servidor no lo tenía seguía sin él), va con TLS a los hosts remotos y sin TLS a los locales
 *   (localhost o un nombre sin dominio, como el servicio `database` de docker-compose).
 * - Pool: `connection_limit` conexiones (por defecto CPUs × 2 + 1, como Prisma) y `pool_timeout`
 *   segundos de espera por una conexión (10 por defecto).
 * - `pgbouncer=true` no hace falta: el adapter no cachea prepared statements.
 *
 * Sin URL (el build de Docker no tiene la base) devuelve un pool sin datos de conexión: igual que
 * con Prisma 6, el error aparece recién en la primera query y no al importar el cliente.
 */
export const pgConfig = (databaseUrl?: string): { pool: PoolConfig; schema?: string } => {
  if (!databaseUrl) return { pool: {} };
  const url = new URL(databaseUrl);
  const param = (name: string) => url.searchParams.get(name) ?? undefined;
  const number = (name: string) => {
    const value = param(name);
    return value === undefined ? undefined : Number(value);
  };

  const sslmode = param('sslmode');
  const useTls = sslmode ? sslmode !== 'disable' : !isLocalHost(url.hostname);
  const ssl = useTls ? { rejectUnauthorized: param('sslaccept') === 'strict' } : false;
  const schema = param('schema');
  const max = number('connection_limit') ?? availableParallelism() * 2 + 1;
  const connectionTimeoutMillis = (number('pool_timeout') ?? 10) * 1000;

  for (const name of PRISMA_PARAMS) url.searchParams.delete(name);

  return {
    pool: { connectionString: url.toString(), ssl, max, connectionTimeoutMillis },
    ...(schema && { schema }),
  };
};
