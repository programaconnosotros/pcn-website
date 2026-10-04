import 'dotenv/config';
import { execFileSync } from 'node:child_process';
import database from './database.cjs';

const { maintenanceUrl, newTestDatabaseName, testDatabaseName, testDatabaseUrl } = database;

const prisma = (args, env, input) =>
  execFileSync('pnpm', ['exec', 'prisma', ...args], {
    env: { ...process.env, ...env },
    input,
    stdio: input ? ['pipe', 'pipe', 'inherit'] : ['ignore', 'pipe', 'inherit'],
  });

/** Recrea la base de tests desde cero con todas las migraciones. */
export default async function globalSetup() {
  // Los workers de Jest arrancan después y heredan este env, igual que el teardown
  process.env.TEST_DATABASE_NAME ??= newTestDatabaseName();
  const url = testDatabaseUrl();
  const admin = { DATABASE_URL: maintenanceUrl(), DIRECT_URL: maintenanceUrl() };
  const name = testDatabaseName();

  prisma(['db', 'execute', '--stdin'], admin, `DROP DATABASE IF EXISTS "${name}" WITH (FORCE);`);
  prisma(['db', 'execute', '--stdin'], admin, `CREATE DATABASE "${name}";`);
  prisma(['migrate', 'deploy'], { DATABASE_URL: url, DIRECT_URL: url });
}
