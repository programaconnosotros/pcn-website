// Base descartable para los tests de integración (`pnpm test:db`): sale de la misma URL que usa la
// app, con otro nombre de base, así nunca toca los datos de desarrollo. Se crea con las migraciones
// al empezar y se borra al terminar.

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1', 'postgres', 'db']);
const SUFFIX = '_integration_test';

const baseUrl = () => {
  const url = process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL;
  if (!url) throw new Error('Definí DATABASE_URL (o TEST_DATABASE_URL) para correr pnpm test:db');
  return new URL(url);
};

/** La URL de la base de tests. Solo en un Postgres local: nunca se crea ni se borra nada remoto. */
const testDatabaseUrl = () => {
  const url = baseUrl();
  if (!LOCAL_HOSTS.has(url.hostname)) {
    throw new Error(`pnpm test:db solo corre contra un Postgres local, no contra ${url.hostname}`);
  }
  // Cada corrida usa su propia base (el global setup fija TEST_DATABASE_NAME antes de levantar
  // los workers), así dos `pnpm test:db` o una corrida de e2e en paralelo no se pisan.
  const name = url.pathname.slice(1) || 'postgres';
  url.pathname = `/${process.env.TEST_DATABASE_NAME ?? `${name}${SUFFIX}`}`;
  return url.toString();
};

/** La base `postgres` del mismo servidor, para crear y borrar la de tests. */
const maintenanceUrl = () => {
  const url = new URL(testDatabaseUrl());
  url.pathname = '/postgres';
  return url.toString();
};

const testDatabaseName = () => new URL(testDatabaseUrl()).pathname.slice(1);

/** Un nombre nuevo para la base de una corrida: `<base>_integration_test_<pid>`. */
const newTestDatabaseName = (kind = 'integration_test') => {
  const name = baseUrl().pathname.slice(1) || 'postgres';
  return `${name}_${kind}_${process.pid}`;
};

module.exports = { testDatabaseUrl, maintenanceUrl, testDatabaseName, newTestDatabaseName };
