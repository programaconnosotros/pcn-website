// Browser smoke check for a running instance of the site (the Docker dev stack, the production
// image, or anything else). Run from the repo root so @playwright/test resolves:
//
//   node .agents/skills/verify-docker/scripts/smoke.mjs http://localhost:3000
//   node .agents/skills/verify-docker/scripts/smoke.mjs http://localhost:3001 --mail juan.perez@example.com
//
// For each page: HTTP status, console errors/warnings, uncaught errors and CSP violations.
// With --mail <email of an existing user>: requests a password reset code through the real form
// (captcha included) and checks that a new message reached MailHog (http://localhost:18025).
// Exits 1 if anything failed.
import { chromium } from '@playwright/test';

const PAGES = [
  '/',
  '/eventos',
  '/historia',
  '/consejos',
  '/galeria',
  '/miembros',
  '/feed',
  '/charlas',
  '/proyectos',
  '/metricas',
  '/iniciar-sesion',
  '/crear-cuenta',
  '/offline',
];
const MAILHOG = 'http://localhost:18025/api/v2/messages';

const [base, ...rest] = process.argv.slice(2);
if (!base) {
  console.error('usage: smoke.mjs <base-url> [--mail <existing user email>]');
  process.exit(2);
}
const mailIndex = rest.indexOf('--mail');
const mailTo = mailIndex >= 0 ? rest[mailIndex + 1] : null;

const browser = await chromium.launch();
let failures = 0;

for (const path of PAGES) {
  const context = await browser.newContext();
  const page = await context.newPage();
  const problems = [];
  // Classic mode: PCN OS would open every page inside a window
  await page.addInitScript(() => {
    localStorage.setItem('pcn-os-mode', 'classic');
    window.__csp = [];
    document.addEventListener('securitypolicyviolation', (event) =>
      window.__csp.push(`${event.violatedDirective} ${event.blockedURI}`),
    );
  });
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning')
      problems.push(`${message.type()}: ${message.text().slice(0, 200)}`);
  });
  page.on('pageerror', (error) => problems.push(`uncaught: ${error.message.slice(0, 200)}`));

  const response = await page.goto(base + path, { waitUntil: 'load', timeout: 120_000 });
  // Not networkidle: the live updates keep a connection open on some pages
  await page.waitForTimeout(2000);
  // In dev the first compile of a route can reload the page once: read after it settles
  let csp = [];
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await page.waitForLoadState('load');
      csp = await page.evaluate(() => window.__csp);
      break;
    } catch {
      await page.waitForTimeout(1000);
    }
  }
  for (const violation of csp) problems.push(`CSP: ${violation}`);
  if (response?.status() !== 200) problems.unshift(`status ${response?.status()}`);

  if (problems.length) failures++;
  console.log(`${problems.length ? '✘' : '✓'} ${path}`);
  for (const problem of problems) console.log(`    ${problem}`);
  await context.close();
}

if (mailTo) {
  const count = async () => (await (await fetch(MAILHOG)).json()).total;
  const before = await count();
  const page = await browser.newPage();
  await page.addInitScript(() => localStorage.setItem('pcn-os-mode', 'classic'));
  await page.goto(`${base}/recuperar-clave`, { waitUntil: 'load' });
  await page.getByLabel('Correo electrónico').fill(mailTo);
  // The button stays disabled until the captcha solves itself
  await page.getByRole('button', { name: /enviarCodigo/ }).click({ timeout: 60_000 });
  await page.getByLabel('Código de verificación').waitFor({ timeout: 60_000 });
  await page.waitForTimeout(1500);
  const after = await count();
  const ok = after > before;
  if (!ok) failures++;
  console.log(`${ok ? '✓' : '✘'} reset code email to ${mailTo}: ${after - before} new in MailHog`);
}

await browser.close();
console.log(failures ? `\n${failures} check(s) failed` : '\nall checks passed');
process.exit(failures ? 1 : 0);
