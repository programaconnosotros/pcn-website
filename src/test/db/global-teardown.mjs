import 'dotenv/config';
import { execFileSync } from 'node:child_process';
import database from './database.cjs';

const { maintenanceUrl, testDatabaseName } = database;

export default async function globalTeardown() {
  if (process.env.KEEP_TEST_DATABASE) return;
  execFileSync('pnpm', ['exec', 'prisma', 'db', 'execute', '--stdin'], {
    env: { ...process.env, DATABASE_URL: maintenanceUrl(), DIRECT_URL: maintenanceUrl() },
    input: `DROP DATABASE IF EXISTS "${testDatabaseName()}" WITH (FORCE);`,
    stdio: ['pipe', 'pipe', 'inherit'],
  });
}
