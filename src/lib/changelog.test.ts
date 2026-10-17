import { changelog, type ChangelogEntry } from '@/data/changelog';
import { visibleChangelog } from './changelog';

const entry = (overrides: Partial<ChangelogEntry>): ChangelogEntry => ({
  date: '2026-09-01',
  area: 'eventos',
  title: 'Cambio',
  description: 'Descripción',
  authors: ['agustin-sanc'],
  ...overrides,
});

const entries = [
  entry({ title: 'Público viejo', date: '2026-08-01' }),
  entry({ title: 'Solo admins', date: '2026-09-15', audience: 'admins' }),
  entry({ title: 'Público nuevo', date: '2026-09-30', audience: 'todos' }),
];

const agustin = { id: 'user-1', name: 'Agustín Sánchez', image: null };

describe('visibleChangelog', () => {
  it('hides admin-only entries from everyone else', () => {
    const titles = visibleChangelog(entries, false, {}).map((e) => e.title);
    expect(titles).toEqual(['Público nuevo', 'Público viejo']);
  });

  it('shows admins every entry, newest first, flagging the admin-only ones', () => {
    const visible = visibleChangelog(entries, true, {});
    expect(visible.map((e) => [e.title, e.adminOnly])).toEqual([
      ['Público nuevo', false],
      ['Solo admins', true],
      ['Público viejo', false],
    ]);
    expect(visible[0]).not.toHaveProperty('audience');
  });

  it('resolves linked GitHub logins to their PCN user and leaves the rest unlinked', () => {
    const [visible] = visibleChangelog(
      [entry({ authors: ['agustin-sanc', 'someone-else'] })],
      false,
      { 'agustin-sanc': agustin },
    );
    expect(visible.authors).toEqual([
      { login: 'agustin-sanc', user: agustin },
      { login: 'someone-else', user: null },
    ]);
  });
});

describe('changelog data', () => {
  it('has valid dates and at least one author per entry', () => {
    for (const { date, authors } of changelog) {
      expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(Number.isNaN(Date.parse(date))).toBe(false);
      expect(authors.length).toBeGreaterThan(0);
    }
  });
});
