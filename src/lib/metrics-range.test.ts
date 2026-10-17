import { parseMetricsRange, previousRange, RANGE_PRESETS } from './metrics-range';

const DAY = 86_400_000;
const now = new Date('2026-10-04T15:00:00Z');

describe('parseMetricsRange', () => {
  it('defaults to the last 30 days', () => {
    const range = parseMetricsRange({}, now);
    expect(range.preset).toBe('30d');
    expect(range.to).toBe(now);
    expect(now.getTime() - range.from.getTime()).toBe(30 * DAY);
  });

  it.each(RANGE_PRESETS.map((preset) => [preset.id, preset.days] as const))(
    'uses the %s preset',
    (id, days) => {
      const range = parseMetricsRange({ rango: id }, now);
      expect(range.preset).toBe(id);
      expect(now.getTime() - range.from.getTime()).toBe(days * DAY);
    },
  );

  it('falls back to 30 days for an unknown preset', () => {
    expect(parseMetricsRange({ rango: '5y' }, now).preset).toBe('30d');
  });

  it('takes custom dates in Argentina time, both days inclusive', () => {
    const range = parseMetricsRange({ desde: '2026-01-01', hasta: '2026-01-31' }, now);
    expect(range.preset).toBeNull();
    expect(range.from.toISOString()).toBe('2026-01-01T03:00:00.000Z');
    expect(range.to.toISOString()).toBe('2026-02-01T03:00:00.000Z');
  });

  it('caps a custom range that ends in the future at now', () => {
    const range = parseMetricsRange({ desde: '2026-10-01', hasta: '2026-12-31' }, now);
    expect(range.to).toBe(now);
    expect(range.preset).toBeNull();
  });

  it('accepts a single-day range', () => {
    const range = parseMetricsRange({ desde: '2026-03-10', hasta: '2026-03-10' }, now);
    expect(range.to.getTime() - range.from.getTime()).toBe(DAY);
  });

  it('ignores reversed custom dates and uses the preset', () => {
    const range = parseMetricsRange({ desde: '2026-02-01', hasta: '2026-01-01', rango: '7d' }, now);
    expect(range.preset).toBe('7d');
  });

  it('ignores malformed or partial custom dates', () => {
    expect(parseMetricsRange({ desde: '2026-1-1', hasta: '2026-01-31' }, now).preset).toBe('30d');
    expect(parseMetricsRange({ desde: '2026-01-01' }, now).preset).toBe('30d');
  });

  it('uses the current time when now is not given', () => {
    const before = Date.now();
    const range = parseMetricsRange({ rango: '7d' });
    expect(range.to.getTime()).toBeGreaterThanOrEqual(before);
  });
});

describe('previousRange', () => {
  it('returns the same-length period that ends where the range starts', () => {
    const from = new Date('2026-01-11T00:00:00Z');
    const to = new Date('2026-01-21T00:00:00Z');
    expect(previousRange({ from, to, preset: null })).toEqual({
      from: new Date('2026-01-01T00:00:00Z'),
      to: from,
    });
  });
});
