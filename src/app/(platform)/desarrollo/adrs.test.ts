import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { adrs } from './adrs';

describe('adrs', () => {
  it('numbers them in order without gaps or repeats, with unique slugs', () => {
    expect(adrs.map((adr) => adr.number)).toEqual(adrs.map((_, i) => i + 1));
    expect(new Set(adrs.map((adr) => adr.slug)).size).toBe(adrs.length);
  });

  it('dates them and fills every part', () => {
    for (const adr of adrs) {
      expect(adr.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(adr.context.length).toBeGreaterThan(40);
      expect(adr.decision.length).toBeGreaterThan(40);
      expect(adr.consequences.length).toBeGreaterThan(0);
    }
  });

  it('only references files that exist and ADRs that exist', () => {
    for (const adr of adrs) {
      for (const ref of adr.references ?? [])
        expect(existsSync(join(process.cwd(), ref))).toBe(true);
      if (adr.supersededBy) {
        expect(adr.status).toBe('reemplazada');
        expect(adrs.some((other) => other.number === adr.supersededBy)).toBe(true);
      }
    }
  });
});
