import 'dotenv/config';

// Dónde corre la suite e2e: una base propia (`<base>_e2e`, recreada en cada corrida) y un build de
// producción en su propio puerto y carpeta. Solo contra un Postgres local.

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1', 'postgres', 'db']);

const source = () => {
  const raw = process.env.E2E_DATABASE_URL ?? process.env.DATABASE_URL;
  if (!raw) throw new Error('Definí DATABASE_URL (o E2E_DATABASE_URL) para correr pnpm test:e2e');
  const url = new URL(raw);
  if (!LOCAL_HOSTS.has(url.hostname)) {
    throw new Error(`pnpm test:e2e solo corre contra un Postgres local, no contra ${url.hostname}`);
  }
  return url;
};

export const E2E_PORT = Number(process.env.E2E_PORT ?? 3300);
export const E2E_BASE_URL = `http://localhost:${E2E_PORT}`;

export const e2eDatabaseName = () => {
  const name = source().pathname.slice(1) || 'postgres';
  return name.endsWith('_e2e') ? name : `${name}_e2e`;
};

export const e2eDatabaseUrl = () => {
  const url = source();
  url.pathname = `/${e2eDatabaseName()}`;
  return url.toString();
};

export const maintenanceDatabaseUrl = () => {
  const url = source();
  url.pathname = '/postgres';
  return url.toString();
};

/** El env del servidor de la suite: su base, su carpeta de build y emails que no salen. */
export const e2eServerEnv = () => ({
  DATABASE_URL: e2eDatabaseUrl(),
  DIRECT_URL: e2eDatabaseUrl(),
  NEXT_DIST_DIR: '.next-e2e',
  EMAIL_TRANSPORT: 'json',
  // `next start` refuses to boot without it; the e2e database is throwaway, so a fixed key is fine.
  TWO_FACTOR_ENCRYPTION_KEY: 'ZTJlLXR3by1mYWN0b3Ita2V5LW5vdC1hLXNlY3JldCE=',
  NEXT_PUBLIC_SITE_URL: E2E_BASE_URL,
  PORT: String(E2E_PORT),
});
