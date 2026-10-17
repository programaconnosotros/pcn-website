// Levanta el servidor de la suite e2e y lo deja corriendo (`pnpm test:e2e:serve`), para iterar
// sobre specs sin recompilar: en otra terminal, `E2E_REUSE_SERVER=1 pnpm test:e2e <spec>`.
// Recrea la base e2e al arrancar, igual que `pnpm test:e2e`.
import { execSync } from 'node:child_process';
import { E2E_BASE_URL, e2eServerEnv } from './env';

const env = { ...process.env, ...e2eServerEnv() };
const run = (command: string) => execSync(command, { env, stdio: 'inherit' });

run('pnpm exec tsx tests/e2e/support/prepare.ts');
run('pnpm exec next build');
console.log(`\nSuite e2e: ${E2E_BASE_URL}\n`);
run('pnpm exec next start');
