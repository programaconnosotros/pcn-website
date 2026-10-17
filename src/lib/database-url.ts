import { connect } from 'node:net';
import { availableParallelism } from 'node:os';
import { PrismaPg } from '@prisma/adapter-pg';

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

/**
 * La configuración del pool de pg para `DATABASE_URL`, con el mismo comportamiento que tenía
 * Prisma 6 con la misma URL. Prisma 7 se conecta con el adapter de pg, que lee la URL a su
 * manera: con `sslmode=require` exige un certificado verificable (uno autofirmado, como el de un
 * Postgres propio, no lo es para Node), sin `sslmode` no usa TLS e ignora `connection_limit` y
 * `pool_timeout`.
 *
 * - TLS: `sslmode=disable` lo apaga y `require` lo prende sin verificar el certificado, salvo
 *   `sslaccept=strict`, como hacía Prisma. Con `prefer` o sin `sslmode` (el default de Prisma 6)
 *   devuelve `prefer` con el host: `pgAdapter` le pregunta al servidor si acepta TLS antes de
 *   conectar y lo usa solo si lo acepta.
 * - Pool: `connection_limit` conexiones (por defecto CPUs × 2 + 1, como Prisma) y `pool_timeout`
 *   segundos de espera por una conexión (10 por defecto).
 * - `pgbouncer=true` no hace falta: el adapter no cachea prepared statements.
 *
 * Sin URL (el build de Docker no tiene la base) devuelve un pool sin datos de conexión: igual que
 * con Prisma 6, el error aparece recién en la primera query y no al importar el cliente.
 */
export const pgConfig = (
  databaseUrl?: string,
): { pool: PoolConfig; schema?: string; prefer?: { host: string; port: number } } => {
  if (!databaseUrl) return { pool: {} };
  const url = new URL(databaseUrl);
  const param = (name: string) => url.searchParams.get(name) ?? undefined;
  const number = (name: string) => {
    const value = param(name);
    return value === undefined ? undefined : Number(value);
  };

  const sslmode = param('sslmode') ?? 'prefer';
  const verify = param('sslaccept') === 'strict';
  const ssl =
    sslmode === 'disable' || sslmode === 'prefer' ? false : { rejectUnauthorized: verify };
  const schema = param('schema');
  const max = number('connection_limit') ?? availableParallelism() * 2 + 1;
  const connectionTimeoutMillis = (number('pool_timeout') ?? 10) * 1000;
  const host = url.hostname.replace(/^\[(.*)\]$/, '$1') || 'localhost';
  const port = Number(url.port || 5432);

  for (const name of PRISMA_PARAMS) url.searchParams.delete(name);

  return {
    pool: { connectionString: url.toString(), ssl, max, connectionTimeoutMillis },
    ...(schema && { schema }),
    ...(sslmode === 'prefer' && { prefer: { host, port } }),
  };
};

/**
 * Si el servidor acepta TLS, preguntado como lo hace libpq con `sslmode=prefer`: el mensaje
 * `SSLRequest` del protocolo de Postgres, que el servidor contesta con `S` o `N`. Si no contesta
 * (caído, timeout), devuelve false y el error real aparece al conectar.
 */
export const serverAcceptsTls = (host: string, port: number, timeoutMs: number) =>
  new Promise<boolean>((resolve) => {
    const socket = connect({ host, port });
    const done = (accepts: boolean) => {
      socket.destroy();
      resolve(accepts);
    };
    socket.setTimeout(timeoutMs || 10_000, () => done(false));
    socket.once('error', () => done(false));
    socket.once('connect', () => {
      const request = Buffer.alloc(8);
      request.writeInt32BE(8, 0);
      request.writeInt32BE(80877103, 4);
      socket.write(request);
    });
    socket.once('data', (data) => done(data[0] === 0x53));
  });

/**
 * El adapter de pg para `DATABASE_URL` (ver `pgConfig`). Con `prefer` decide el TLS al conectar,
 * después de preguntarle al servidor, así funciona igual con un Postgres con TLS que sin él.
 */
export const pgAdapter = (
  databaseUrl?: string,
): Pick<PrismaPg, 'provider' | 'adapterName' | 'connect'> => {
  const { pool, schema, prefer } = pgConfig(databaseUrl);
  const options = schema ? { schema } : undefined;
  const adapter = new PrismaPg(pool, options);
  if (!prefer) return adapter;

  const verify = new URL(databaseUrl!).searchParams.get('sslaccept') === 'strict';
  return {
    provider: adapter.provider,
    adapterName: adapter.adapterName,
    connect: async () => {
      const tls = await serverAcceptsTls(prefer.host, prefer.port, pool.connectionTimeoutMillis!);
      const ssl = tls ? { rejectUnauthorized: verify } : false;
      return new PrismaPg({ ...pool, ssl }, options).connect();
    },
  };
};
