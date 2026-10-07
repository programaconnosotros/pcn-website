import type { ContributorPull } from '@/lib/github-stats';

export type PullKind =
  'feature' | 'fix' | 'refactor' | 'config' | 'docs' | 'test' | 'design' | 'other';

/** The kinds in the order the summary lists them, with their label. */
export const PULL_KINDS: { kind: PullKind; label: string }[] = [
  { kind: 'feature', label: 'features' },
  { kind: 'fix', label: 'fixes' },
  { kind: 'design', label: 'diseño y UI' },
  { kind: 'refactor', label: 'refactors y performance' },
  { kind: 'config', label: 'configuración y mantenimiento' },
  { kind: 'test', label: 'tests' },
  { kind: 'docs', label: 'documentación' },
  { kind: 'other', label: 'otros' },
];

// Conventional commit prefixes (`feat(scope): …`, `fix!: …`).
const PREFIXES: Record<string, PullKind> = {
  feat: 'feature',
  feature: 'feature',
  fix: 'fix',
  hotfix: 'fix',
  bugfix: 'fix',
  refactor: 'refactor',
  perf: 'refactor',
  chore: 'config',
  ci: 'config',
  build: 'config',
  deps: 'config',
  config: 'config',
  revert: 'config',
  docs: 'docs',
  doc: 'docs',
  test: 'test',
  tests: 'test',
  style: 'design',
  ui: 'design',
  design: 'design',
};

// Titles without a prefix, by their first words (in Spanish or English).
const KEYWORDS: [RegExp, PullKind][] = [
  [/^(fix|arregl|correg|solucion|bug)/i, 'fix'],
  [/^(refactor|optimiz|mejora de rendimiento|perf)/i, 'refactor'],
  [/^(test|e2e|cobertura|coverage)/i, 'test'],
  [/^(doc|readme)/i, 'docs'],
  [/^(bump|update dep|actualiz.* dependenc|upgrade|ci\b|config|setup|deploy|migra)/i, 'config'],
  [/^(estilo|diseñ|ui\b|ux\b|style|redesign|rediseñ)/i, 'design'],
  [/^(add|agreg|añad|nuev|new|crea|create|implement|feature|soporte|support|permit)/i, 'feature'],
];

/** What kind of change a PR was, from its title. */
export const pullKind = (title: string): PullKind => {
  const prefix = title.match(/^\s*([a-z]+)(\([^)]*\))?!?:/i)?.[1]?.toLowerCase();
  if (prefix && PREFIXES[prefix]) return PREFIXES[prefix];
  return KEYWORDS.find(([pattern]) => pattern.test(title.trim()))?.[1] ?? 'other';
};

/** The title without its conventional prefix: `feat(eventos): sponsor logos` → `sponsor logos`. */
export const pullSummary = (title: string) =>
  title.replace(/^\s*[a-z]+(\([^)]*\))?!?:\s*/i, '').replace(/^./, (c) => c.toUpperCase());

/** PRs grouped by kind, in `PULL_KINDS` order, skipping empty kinds. */
export const groupPulls = (pulls: ContributorPull[]) =>
  PULL_KINDS.map(({ kind, label }) => ({
    kind,
    label,
    pulls: pulls.filter((pull) => pullKind(pull.title) === kind),
  })).filter((group) => group.pulls.length > 0);
