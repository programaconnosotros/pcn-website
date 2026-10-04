// The whole test case repository of /desarrollo/calidad: the hand-written manual cases plus one
// automated case per real test in the repo (generated into automated-cases.ts).
import { automatedSuites, type AutomatedSuite } from './automated-cases';
import { authCases, eventCases, talkCases } from './manual-cases/auth-events';
import {
  adviceCases,
  galleryCases,
  notificationCases,
  profileCases,
  projectCases,
  readingCases,
  testimonialCases,
} from './manual-cases/content';
import {
  adminCases,
  conversationCases,
  interviewCases,
  osCases,
  platformCases,
  pwaCases,
  searchCases,
} from './manual-cases/platform';
import type { AutomatedLayer, TestCase } from './quality-areas';

export const manualCases: TestCase[] = [
  ...authCases,
  ...eventCases,
  ...talkCases,
  ...galleryCases,
  ...profileCases,
  ...adviceCases,
  ...testimonialCases,
  ...projectCases,
  ...readingCases,
  ...conversationCases,
  ...interviewCases,
  ...notificationCases,
  ...searchCases,
  ...osCases,
  ...pwaCases,
  ...adminCases,
  ...platformCases,
];

export const layerLabels: Record<AutomatedLayer, string> = {
  unit: 'unit',
  component: 'componente',
  'server-action': 'server action',
  'route-handler': 'route handler',
  integration: 'integración',
  e2e: 'e2e',
};

const preconditionsByLayer: Record<AutomatedLayer, string[]> = {
  unit: ['pnpm install'],
  component: [
    'pnpm install',
    'jsdom con Testing Library; router de Next y server actions mockeados',
  ],
  'server-action': [
    'pnpm install',
    'Prisma, cookies() y headers() mockeados por jest.setup.ts (no hace falta base de datos)',
  ],
  'route-handler': ['pnpm install', 'Prisma y S3 mockeados (no hace falta base de datos)'],
  integration: [
    'pnpm install',
    'Postgres local corriendo (DATABASE_URL); pnpm test:db crea y borra su propia base con las migraciones',
  ],
  e2e: [
    'Postgres local corriendo (DATABASE_URL) y npx playwright install chromium',
    'pnpm test:e2e recrea la base e2e con el seed, compila y levanta la app en el puerto 3300',
  ],
};

const expectedByLayer: Record<AutomatedLayer, string> = {
  unit: 'El test pasa. Corre en cada pre-push junto con el resto de la suite.',
  component: 'El test pasa. Corre en cada pre-push junto con el resto de la suite.',
  'server-action': 'El test pasa. Corre en cada pre-push junto con el resto de la suite.',
  'route-handler': 'El test pasa. Corre en cada pre-push junto con el resto de la suite.',
  integration:
    'El test pasa contra Postgres real. Se corre con pnpm test:db al tocar queries, schema o server actions, y en la regresión semanal.',
  e2e: 'El test pasa en Chromium (desktop, y Pixel 7 en los specs mobile). Corre en la regresión semanal.',
};

// Jest matches -t against the describe and test titles joined by spaces.
const runCommand = (suite: AutomatedSuite, name: string) =>
  suite.layer === 'e2e'
    ? `pnpm test:e2e ${suite.file} -g "${name}"`
    : `pnpm ${suite.layer === 'integration' ? 'test:db' : 'test'} -- "${suite.file}" -t "${name.replaceAll(' › ', ' ')}"`;

export const automatedCases: TestCase[] = automatedSuites.flatMap((suite) =>
  suite.tests.map(([id, name]) => ({
    id,
    title: name,
    area: suite.area,
    type: 'automatizado' as const,
    priority: suite.priority,
    preconditions: preconditionsByLayer[suite.layer],
    steps: [runCommand(suite, name)],
    expected: expectedByLayer[suite.layer],
    automation: { file: suite.file, name, layer: suite.layer },
  })),
);

// Los specs e2e se nombran con el id del caso manual que automatizan (`TC-AUT-001 …`): así cada
// caso manual sabe qué tests lo cubren en la regresión semanal.
const e2eTestsByCase = new Map<string, NonNullable<TestCase['automatedBy']>>();
for (const suite of automatedSuites.filter((s) => s.layer === 'e2e')) {
  for (const [, name] of suite.tests) {
    const caseId = name.match(/(?:^|› )(TC-[A-Z]+-\d{3})\b/)?.[1];
    if (!caseId) continue;
    const tests = e2eTestsByCase.get(caseId) ?? [];
    tests.push({ file: suite.file, name, command: runCommand(suite, name) });
    e2eTestsByCase.set(caseId, tests);
  }
}

const manualWithAutomation: TestCase[] = manualCases.map((c) =>
  e2eTestsByCase.has(c.id) ? { ...c, automatedBy: e2eTestsByCase.get(c.id) } : c,
);

/** Manual cases that the weekly e2e regression already runs. */
export const manualCasesAutomated = manualWithAutomation.filter((c) => c.automatedBy).length;

export const testCases: TestCase[] = [...manualWithAutomation, ...automatedCases];

export { AUTOMATED_CASES_UPDATED_AT, automatedSuites } from './automated-cases';
