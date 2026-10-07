import { groupPulls, pullKind, pullSummary } from './pull-kinds';

describe('pullKind', () => {
  it.each([
    ['feat(eventos): sponsor logos', 'feature'],
    ['fix!: login loop', 'fix'],
    ['chore(deps): bump next', 'config'],
    ['ci: cache pnpm', 'config'],
    ['perf(galeria): lazy grid', 'refactor'],
    ['docs: ADRs', 'docs'],
    ['test(e2e): mobile nav', 'test'],
    ['style: spacing', 'design'],
    ['Agregar página de setups', 'feature'],
    ['Work offers', 'other'],
    ['Arreglo del header', 'fix'],
    ['Bump typescript to 6', 'config'],
  ])('%s → %s', (title, kind) => {
    expect(pullKind(title)).toBe(kind);
  });
});

describe('pullSummary', () => {
  it('drops the conventional prefix and capitalizes', () => {
    expect(pullSummary('feat(eventos): sponsor logos')).toBe('Sponsor logos');
    expect(pullSummary('Work offers')).toBe('Work offers');
  });
});

describe('groupPulls', () => {
  it('groups by kind in a fixed order, leaving out empty kinds', () => {
    const pull = (number: number, title: string) => ({ number, title, mergedAt: '2026-01-01' });
    const groups = groupPulls([pull(1, 'fix: a'), pull(2, 'feat: b'), pull(3, 'feat: c')]);
    expect(groups.map((group) => [group.kind, group.pulls.length])).toEqual([
      ['feature', 2],
      ['fix', 1],
    ]);
  });
});
