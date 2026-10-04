// Recrea la base e2e desde cero: migraciones, el seed general y los datos fijos de la suite.
// Lo corre el webServer de playwright.config.ts antes de compilar y levantar la app.
import { execFileSync } from 'node:child_process';
import { e2eDatabaseName, e2eDatabaseUrl, maintenanceDatabaseUrl } from './env';

const run = (command: string, args: string[], env: Record<string, string>, input?: string) =>
  execFileSync(command, args, {
    env: { ...process.env, ...env },
    input,
    stdio: input ? ['pipe', 'inherit', 'inherit'] : 'inherit',
  });

const url = e2eDatabaseUrl();
const admin = { DATABASE_URL: maintenanceDatabaseUrl(), DIRECT_URL: maintenanceDatabaseUrl() };
const name = e2eDatabaseName();
const target = { DATABASE_URL: url, DIRECT_URL: url };

run(
  'pnpm',
  ['exec', 'prisma', 'db', 'execute', '--stdin'],
  admin,
  `DROP DATABASE IF EXISTS "${name}" WITH (FORCE);`,
);
run('pnpm', ['exec', 'prisma', 'db', 'execute', '--stdin'], admin, `CREATE DATABASE "${name}";`);
run('pnpm', ['exec', 'prisma', 'migrate', 'deploy'], target);
run('pnpm', ['exec', 'tsx', 'prisma/seed.ts'], target);
run('pnpm', ['exec', 'tsx', 'tests/e2e/support/seed-e2e.ts'], target);
