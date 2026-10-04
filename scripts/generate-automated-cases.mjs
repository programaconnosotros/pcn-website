// Writes the list of automated test cases that /desarrollo/calidad shows: every Jest test under
// src/ (taken from real `jest --json` runs, so names match what Jest reports: `pnpm test` and the
// integration suite of `pnpm test:db`, which needs the local Postgres) plus the Playwright specs
// in tests/. Run it after adding, renaming or removing tests: `pnpm qa:cases`.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const OUT = 'src/app/(platform)/desarrollo/calidad/automated-cases.ts';

// Which area of the site each test file belongs to. First match wins; a new test file that
// matches nothing makes the script fail, so it has to be added here.
const AREAS = [
  [/^src\/actions\/auth\//, 'auth'],
  [/^src\/lib\/(password|session|verification-codes|safe-redirect)\./, 'auth'],
  [/^src\/actions\/(events|announcements)\//, 'eventos'],
  [/^src\/lib\/(event-|ics|google-calendar)/, 'eventos'],
  [/^src\/schemas\/event-schema/, 'eventos'],
  [/^src\/actions\/(talks|talk-proposals)\//, 'charlas'],
  [/^src\/actions\/gallery\//, 'galeria'],
  [/^src\/lib\/google-maps/, 'eventos'],
  [/^src\/lib\/(gallery-|photo-processing)/, 'galeria'],
  [/^src\/components\/photo-gallery\//, 'galeria'],
  [/^src\/app\/api\/galeria\//, 'galeria'],
  [/^src\/actions\/(update-profile|badges|setups)/, 'perfil'],
  [/^src\/lib\/(achievements|github-contributions)/, 'perfil'],
  [/^src\/actions\/(advises|comments)\//, 'consejos'],
  [/^src\/lib\/consejos/, 'consejos'],
  [/^src\/actions\/testimonials\//, 'testimonios'],
  [/^src\/actions\/projects\//, 'proyectos'],
  [/^src\/actions\/(articles|content-marks)\//, 'lectura'],
  [/^src\/lib\/embeddable/, 'lectura'],
  [/^src\/lib\/og\//, 'perfil'],
  [/^src\/app\/\(platform\)\/entrevistas\//, 'entrevistas'],
  [/^src\/actions\/notifications\//, 'notificaciones'],
  [/^src\/lib\/(search\/|people-search)/, 'busqueda'],
  [/^src\/actions\/users\/get-user-summary/, 'perfil'],
  [/^src\/actions\/(users|logs|errors|analytics|identity-links)\//, 'admin'],
  [/^src\/actions\/upload\//, 'plataforma'],
  [
    /^src\/lib\/(rate-limit|client-ip|email|s3|changelog|rss|cache|prisma-models|database-url)/,
    'plataforma',
  ],
  [/^src\/app\/\(platform\)\/desarrollo\//, 'plataforma'],
  [/^src\/components\/desarrollo\//, 'plataforma'],
  [/^src\/lib\/tab-title/, 'plataforma'],
  [
    /^src\/(lib\/(sql-safety|safe-fetch|csp|server-action-auth|security-alerts)|test\/|proxy)/,
    'plataforma',
  ],
  [/^src\/components\/os\//, 'pcn-os'],
  [/^tests\/e2e\/(auth|login|registro|recuperar)/, 'auth'],
  [/^tests\/e2e\/eventos/, 'eventos'],
  [/^tests\/e2e\/charlas/, 'charlas'],
  [/^tests\/e2e\/galeria/, 'galeria'],
  [/^tests\/e2e\/(perfil|logros|setups)/, 'perfil'],
  [/^tests\/e2e\/consejos/, 'consejos'],
  [/^tests\/e2e\/testimonios/, 'testimonios'],
  [/^tests\/e2e\/proyectos/, 'proyectos'],
  [/^tests\/e2e\/lectura/, 'lectura'],
  [/^tests\/e2e\/conversaciones/, 'conversaciones'],
  [/^tests\/e2e\/entrevistas/, 'entrevistas'],
  [/^tests\/e2e\/notificaciones/, 'notificaciones'],
  [/^tests\/e2e\/(busqueda|miembros)/, 'busqueda'],
  [/^tests\/e2e\/(os|pcn-os)/, 'pcn-os'],
  [/^tests\/e2e\/(pwa|offline)/, 'pwa'],
  [/^tests\/e2e\/admin/, 'admin'],
  [/^tests\/.*\.spec\.ts$/, 'plataforma'],
];

const CODES = {
  auth: 'AUT',
  eventos: 'EVT',
  charlas: 'CHA',
  galeria: 'GAL',
  perfil: 'PER',
  consejos: 'CON',
  testimonios: 'TES',
  proyectos: 'PRO',
  lectura: 'LEC',
  conversaciones: 'CNV',
  entrevistas: 'ENT',
  notificaciones: 'NOT',
  busqueda: 'BUS',
  'pcn-os': 'OS',
  pwa: 'PWA',
  admin: 'ADM',
  plataforma: 'PLT',
};

// Files guarding security, money-like limits or data integrity are high priority; pure
// formatting and static content checks are low. Everything else is medium.
const HIGH = [
  /^src\/actions\/auth\//,
  /^src\/lib\/(password|session|verification-codes|safe-redirect|rate-limit\.|client-ip|event-access|event-permissions|event-waitlist|gallery-signing|embeddable|s3)/,
  /^src\/actions\/events\/(register-event|cancel-registration|check-event-capacity|organizer-actions|delete-registration)/,
  /^src\/actions\/users\/set-user-role/,
  /^src\/actions\/upload\//,
  /^src\/app\/api\/galeria\/\[id\]\/descargar/,
  /^src\/(lib\/(sql-safety|safe-fetch|csp|server-action-auth|security-alerts)|test\/sql-injection|proxy)/,
  /\.db\.test\.ts$/,
];
const LOW = [
  /^src\/lib\/(changelog|rss|ics|github-contributions|achievements)/,
  /^src\/app\/\(platform\)\/entrevistas\//,
  /^tests\//,
];

// Componentes y páginas, por carpeta: src/components/<carpeta>/ y src/app/(platform)/<ruta>/.
// Se mira después de AREAS, así un patrón más específico de arriba gana.
const FOLDER_AREAS = {
  auth: 'auth',
  autenticacion: 'auth',
  events: 'eventos',
  eventos: 'eventos',
  announcements: 'eventos',
  anuncios: 'eventos',
  talks: 'charlas',
  charlas: 'charlas',
  'talk-proposals': 'charlas',
  'photo-gallery': 'galeria',
  galeria: 'galeria',
  profile: 'perfil',
  perfil: 'perfil',
  badges: 'perfil',
  logros: 'perfil',
  setups: 'perfil',
  advises: 'consejos',
  consejos: 'consejos',
  testimonials: 'testimonios',
  testimonios: 'testimonios',
  projects: 'proyectos',
  proyectos: 'proyectos',
  'web-reader': 'lectura',
  lectura: 'lectura',
  conversations: 'conversaciones',
  conversaciones: 'conversaciones',
  interviews: 'entrevistas',
  entrevistas: 'entrevistas',
  notificaciones: 'notificaciones',
  search: 'busqueda',
  people: 'busqueda',
  comunity: 'busqueda',
  users: 'busqueda',
  miembros: 'busqueda',
  usuarios: 'admin',
  os: 'pcn-os',
  admin: 'admin',
  analytics: 'admin',
  analiticas: 'admin',
  errors: 'admin',
  logs: 'admin',
  monitoreo: 'admin',
  metricas: 'admin',
  visitas: 'admin',
};

const layerOf = (file) => {
  if (file.startsWith('tests/')) return 'e2e';
  if (file.endsWith('.db.test.ts')) return 'integration';
  if (file.endsWith('.test.tsx')) return 'component';
  if (file.startsWith('src/actions/')) return 'server-action';
  if (/\/route\.test\.ts$/.test(file)) return 'route-handler';
  return 'unit';
};

const areaOf = (file) => {
  const match = AREAS.find(([pattern]) => pattern.test(file));
  if (match) return match[1];
  const folder = file.match(/^src\/(?:components|app\/\(platform\)|app)\/([^/]+)\//)?.[1];
  if (folder && FOLDER_AREAS[folder]) return FOLDER_AREAS[folder];
  if (/^src\/(components|app|hooks|lib|schemas|data)\//.test(file)) return 'plataforma';
  throw new Error(`${file}: no area matches it, add one to AREAS in this script`);
};

const priorityOf = (file) =>
  HIGH.some((p) => p.test(file)) ? 'alta' : LOW.some((p) => p.test(file)) ? 'baja' : 'media';

// ─── Jest ────────────────────────────────────────────────────────────────────
const runJest = (config) => {
  const dir = mkdtempSync(join(tmpdir(), 'pcn-qa-'));
  const report = join(dir, 'jest.json');
  try {
    execFileSync(
      'node_modules/.bin/jest',
      [...(config ? ['--config', config] : []), '--json', `--outputFile=${report}`, '--silent'],
      { stdio: ['ignore', 'ignore', 'inherit'] },
    );
  } catch {
    // A failing test still lands in the report; the list of cases doesn't depend on it passing.
  }
  try {
    return JSON.parse(readFileSync(report, 'utf8'));
  } catch {
    throw new Error(`jest ${config ?? ''} wrote no report (for test:db, is Postgres running?)`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
};
const jest = {
  testResults: [...runJest().testResults, ...runJest('jest.db.config.mjs').testResults],
};

// A suite that crashed before running (e.g. a timeout under load) reports no tests at all;
// writing that would silently drop its cases, so stop instead.
const crashed = jest.testResults.filter((result) => result.assertionResults.length === 0);
if (crashed.length) {
  throw new Error(
    `These suites reported no tests, run again: ${crashed.map((r) => relative(ROOT, r.name)).join(', ')}`,
  );
}

const files = jest.testResults.map((result) => ({
  file: relative(ROOT, result.name),
  tests: result.assertionResults.map((a) => [...a.ancestorTitles, a.title].join(' › ')),
}));

// ─── Playwright ──────────────────────────────────────────────────────────────
// Only listed, not run (they need the e2e server): `playwright test --list` gives the real names,
// describe blocks included. The same test in the desktop and mobile projects is listed once.
const listed = JSON.parse(
  execFileSync('node_modules/.bin/playwright', ['test', '--list', '--reporter=json'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  }),
);
const e2e = new Map();
const walk = (suite, titles) => {
  for (const spec of suite.specs ?? []) {
    if (spec.file.endsWith('.setup.ts')) continue;
    const file = `tests/e2e/${spec.file}`;
    if (!e2e.has(file)) e2e.set(file, new Set());
    e2e.get(file).add([...titles, spec.title].join(' › '));
  }
  for (const child of suite.suites ?? []) walk(child, [...titles, child.title]);
};
for (const suite of listed.suites) walk(suite, []);
for (const [file, tests] of e2e) files.push({ file, tests: [...tests] });

files.sort((a, b) => a.file.localeCompare(b.file));

const counters = {};
const suites = files.map(({ file, tests }) => {
  const area = areaOf(file);
  return {
    file,
    area,
    layer: layerOf(file),
    priority: priorityOf(file),
    tests: tests.map((name) => {
      counters[area] = (counters[area] ?? 0) + 1;
      return [`TC-${CODES[area]}-A${String(counters[area]).padStart(3, '0')}`, name];
    }),
  };
});

const total = suites.reduce((sum, suite) => sum + suite.tests.length, 0);
const today = new Date().toISOString().slice(0, 10);

writeFileSync(
  OUT,
  `// Generated by scripts/generate-automated-cases.mjs from a real Jest run — don't edit by hand.
// Run \`pnpm qa:cases\` after adding, renaming or removing tests.

import type { AutomatedLayer, QualityAreaId, TestCasePriority } from './quality-areas';

export type AutomatedSuite = {
  file: string;
  area: QualityAreaId;
  layer: AutomatedLayer;
  priority: TestCasePriority;
  /** [case id, full test name (describe › it)] */
  tests: [string, string][];
};

export const AUTOMATED_CASES_UPDATED_AT = '${today}';

export const automatedSuites: AutomatedSuite[] = ${JSON.stringify(suites)};
`,
);
execFileSync('node_modules/.bin/prettier', ['--write', OUT], { stdio: 'ignore' });
console.log(`${OUT}: ${suites.length} files, ${total} automated cases`);
