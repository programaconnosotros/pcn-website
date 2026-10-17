import { pullSummary } from './pull-kinds';

describe('pullSummary', () => {
  it('drops the conventional prefix and capitalizes', () => {
    expect(pullSummary('feat(eventos): sponsor logos')).toBe('Sponsor logos');
    expect(pullSummary('Work offers')).toBe('Work offers');
  });
});
