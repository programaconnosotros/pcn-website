// Writes the list of automated test cases that /desarrollo/calidad shows: every Jest test under
// src/ (taken from a real `jest --json` run, so names match what Jest reports) plus the Playwright
// specs in tests/. Run it after adding, renaming or removing tests: `pnpm qa:cases`.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
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
  [/^src\/lib\/(gallery-|photo-processing)/, 'galeria'],
  [/^src\/components\/photo-gallery\//, 'galeria'],
  [/^src\/app\/api\/galeria\//, 'galeria'],
  [/^src\/actions\/(update-profile|badges|setups)/, 'perfil'],
  [/^src\/lib\/(achievements|github-contributions)/, 'perfil'],
  [/^src\/actions\/(advises|comments)\//, 'consejos'],
  [/^src\/actions\/testimonials\//, 'testimonios'],
  [/^src\/actions\/projects\//, 'proyectos'],
  [/^src\/actions\/(articles|content-marks)\//, 'lectura'],
  [/^src\/lib\/embeddable/, 'lectura'],
  [/^src\/app\/\(platform\)\/entrevistas\//, 'entrevistas'],
  [/^src\/actions\/notifications\//, 'notificaciones'],
  [/^src\/lib\/(search\/|people-search)/, 'busqueda'],
  [/^src\/actions\/(users|logs|errors|analytics|identity-links)\//, 'admin'],
  [/^src\/actions\/upload\//, 'plataforma'],
  [/^src\/lib\/(rate-limit|email|s3|changelog|rss)/, 'plataforma'],
  [/^src\/app\/\(platform\)\/desarrollo\//, 'plataforma'],
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
  /^src\/lib\/(password|session|verification-codes|safe-redirect|rate-limit\.|event-access|event-permissions|event-waitlist|gallery-signing|embeddable|s3)/,
  /^src\/actions\/events\/(register-event|cancel-registration|check-event-capacity|organizer-actions|delete-registration)/,
  /^src\/actions\/users\/set-user-role/,
  /^src\/actions\/upload\//,
  /^src\/app\/api\/galeria\/\[id\]\/descargar/,
];
const LOW = [
  /^src\/lib\/(changelog|rss|ics|github-contributions|achievements)/,
  /^src\/app\/\(platform\)\/entrevistas\//,
  /^tests\//,
];

const layerOf = (file) => {
  if (file.startsWith('tests/')) return 'e2e';
  if (file.startsWith('src/actions/')) return 'server-action';
  if (/\/route\.test\.ts$/.test(file)) return 'route-handler';
  return 'unit';
};

const areaOf = (file) => {
  const match = AREAS.find(([pattern]) => pattern.test(file));
  if (!match) throw new Error(`${file}: no area matches it, add one to AREAS in this script`);
  return match[1];
};

const priorityOf = (file) =>
  HIGH.some((p) => p.test(file)) ? 'alta' : LOW.some((p) => p.test(file)) ? 'baja' : 'media';

// ─── Jest ────────────────────────────────────────────────────────────────────
const dir = mkdtempSync(join(tmpdir(), 'pcn-qa-'));
const report = join(dir, 'jest.json');
try {
  execFileSync('node_modules/.bin/jest', ['--json', `--outputFile=${report}`, '--silent'], {
    stdio: ['ignore', 'ignore', 'inherit'],
  });
} catch {
  // A failing test still lands in the report; the list of cases doesn't depend on it passing.
}
const jest = JSON.parse(readFileSync(report, 'utf8'));
rmSync(dir, { recursive: true, force: true });

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
// Only listed, not run: these need a live server. Top-level `test('name', …)` calls.
for (const name of readdirSync('tests').filter((f) => f.endsWith('.spec.ts'))) {
  const source = readFileSync(join('tests', name), 'utf8');
  const tests = [...source.matchAll(/^test\((['"`])(.+?)\1/gm)].map((m) => m[2]);
  if (tests.length) files.push({ file: `tests/${name}`, tests });
}

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
