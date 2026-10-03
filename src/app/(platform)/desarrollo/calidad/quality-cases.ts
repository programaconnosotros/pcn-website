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
  'server-action': 'server action',
  'route-handler': 'route handler',
  e2e: 'e2e',
};

const preconditionsByLayer: Record<AutomatedLayer, string[]> = {
  unit: ['pnpm install'],
  'server-action': [
    'pnpm install',
    'Prisma, cookies() y headers() mockeados por jest.setup.ts (no hace falta base de datos)',
  ],
  'route-handler': ['pnpm install', 'Prisma y S3 mockeados (no hace falta base de datos)'],
  e2e: ['App corriendo en http://localhost:3000', 'npx playwright install'],
};

// Jest matches -t against the describe and test titles joined by spaces.
const runCommand = (suite: AutomatedSuite, name: string) =>
  suite.layer === 'e2e'
    ? `npx playwright test ${suite.file} -g "${name}"`
    : `pnpm test -- "${suite.file}" -t "${name.replaceAll(' › ', ' ')}"`;

export const automatedCases: TestCase[] = automatedSuites.flatMap((suite) =>
  suite.tests.map(([id, name]) => ({
    id,
    title: name,
    area: suite.area,
    type: 'automatizado' as const,
    priority: suite.priority,
    preconditions: preconditionsByLayer[suite.layer],
    steps: [runCommand(suite, name)],
    expected:
      suite.layer === 'e2e'
        ? 'El test pasa en Chromium, Firefox y WebKit.'
        : 'El test pasa. Corre en cada pre-push junto con el resto de la suite.',
    automation: { file: suite.file, name, layer: suite.layer },
  })),
);

export const testCases: TestCase[] = [...manualCases, ...automatedCases];

export { AUTOMATED_CASES_UPDATED_AT, automatedSuites } from './automated-cases';
