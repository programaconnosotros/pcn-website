import { SHORTCUT_GROUPS, filterShortcuts, keyLabel } from './shortcuts';

describe('shortcuts', () => {
  it('labels the modifier key per platform', () => {
    expect(keyLabel('Mod', true)).toBe('⌘');
    expect(keyLabel('Mod', false)).toBe('Ctrl');
    expect(keyLabel('j', true)).toBe('j');
  });

  it('has unique group ids', () => {
    const ids = SHORTCUT_GROUPS.map((group) => group.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('filters by description or key, ignoring accents', () => {
    const groups = filterShortcuts(SHORTCUT_GROUPS, 'busqueda');
    expect(groups.flatMap((g) => g.shortcuts.map((s) => s.description))).toContain(
      'Búsqueda global',
    );
    expect(filterShortcuts(SHORTCUT_GROUPS, 'gg')[0].shortcuts).toEqual([
      { keys: ['gg'], description: 'Ir al principio' },
    ]);
  });

  it('keeps a whole group when its title matches', () => {
    const [galeria] = filterShortcuts(SHORTCUT_GROUPS, 'galeria');
    expect(galeria.id).toBe('galeria');
    expect(galeria.shortcuts).toHaveLength(
      SHORTCUT_GROUPS.find((g) => g.id === 'galeria')!.shortcuts.length,
    );
  });

  it('returns everything for a blank query and nothing for nonsense', () => {
    expect(filterShortcuts(SHORTCUT_GROUPS, '  ')).toBe(SHORTCUT_GROUPS);
    expect(filterShortcuts(SHORTCUT_GROUPS, 'zzzz')).toEqual([]);
  });
});
