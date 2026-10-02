import { normalizeSearchText, rankEntries, toEntry } from './search-index';

const entries = [
  toEntry({ type: 'curso', title: 'Git & GitHub', href: '/cursos/git' }, 'Control de versiones'),
  toEntry({ type: 'especialidad', title: 'Marketing', href: '/e/m' }, 'Transformación digital'),
  toEntry({ type: 'conversacion', title: 'Rebase vs merge', href: '/c/1' }, 'Usamos git a diario'),
  toEntry({ type: 'lectura', title: 'Programación funcional', href: '/l/1' }),
];

describe('normalizeSearchText', () => {
  it('strips accents and punctuation and pads with a leading space', () => {
    expect(normalizeSearchText('Programación CI/CD!')).toBe(' programacion ci cd');
  });
});

describe('rankEntries', () => {
  it('matches words by prefix, not anywhere inside a word', () => {
    const titles = rankEntries(entries, 'git').map((r) => r.title);

    expect(titles).toContain('Git & GitHub');
    expect(titles).toContain('Rebase vs merge');
    expect(titles).not.toContain('Marketing'); // "digital" contains "git"
  });

  it('ignores accents and case', () => {
    expect(rankEntries(entries, 'PROGRAMACION').map((r) => r.title)).toEqual([
      'Programación funcional',
    ]);
  });

  it('requires every word and ranks title matches first within a type', () => {
    const results = rankEntries(
      [
        toEntry(
          { type: 'conversacion', title: 'Hablamos de docker', href: '/1' },
          'y de kubernetes',
        ),
        toEntry({ type: 'conversacion', title: 'Docker y Kubernetes', href: '/2' }),
        toEntry({ type: 'conversacion', title: 'Solo docker', href: '/3' }),
      ],
      'docker kubernetes',
    );

    expect(results.map((r) => r.href)).toEqual(['/2', '/1']);
  });

  it('caps results per type and strips index-only fields', () => {
    const many = Array.from({ length: 8 }, (_, i) =>
      toEntry({ type: 'video', title: `React ${i}`, href: `/v/${i}` }),
    );
    const results = rankEntries(many, 'react', 5);

    expect(results).toHaveLength(5);
    expect(results[0]).toEqual({ type: 'video', title: 'React 0', href: '/v/0' });
  });

  it('returns nothing for a blank query', () => {
    expect(rankEntries(entries, '   ')).toEqual([]);
  });
});
