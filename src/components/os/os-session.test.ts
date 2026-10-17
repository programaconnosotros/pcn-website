import {
  MAX_RESTORED_WINDOWS,
  isSafePath,
  parseSession,
  restoreOrder,
  toSession,
  type SavedWindow,
} from './os-session';
import type { OsWindowState } from './os-window-geometry';

const saved = (path: string, extra: Partial<SavedWindow> = {}): SavedWindow => ({
  path,
  x: 10,
  y: 40,
  w: 800,
  h: 600,
  minimized: false,
  maximized: false,
  snap: null,
  ...extra,
});

const live = (id: string, path: string, extra: Partial<OsWindowState> = {}): OsWindowState => ({
  id,
  src: '/',
  title: 'Título',
  ...saved(path),
  ...extra,
});

describe('isSafePath', () => {
  it('accepts paths of this site', () => {
    expect(isSafePath('/')).toBe(true);
    expect(isSafePath('/eventos?tab=pasados')).toBe(true);
  });

  it('rejects anything that could load another origin', () => {
    expect(isSafePath('//evil.example')).toBe(false);
    expect(isSafePath('/\\evil.example')).toBe(false);
    expect(isSafePath('https://evil.example')).toBe(false);
    expect(isSafePath('javascript:alert(1)')).toBe(false);
    expect(isSafePath(42)).toBe(false);
  });
});

describe('parseSession', () => {
  const raw = (value: unknown) => JSON.stringify(value);

  it('reads a saved session', () => {
    const session = { viewport: { w: 1440, h: 900 }, windows: [saved('/feed'), saved('/')] };
    expect(parseSession(raw(session))).toEqual(session);
  });

  it('returns null for missing, broken or empty sessions', () => {
    expect(parseSession(null)).toBeNull();
    expect(parseSession('{nope')).toBeNull();
    expect(parseSession(raw({ windows: [saved('/')] }))).toBeNull();
    expect(parseSession(raw({ viewport: { w: 0, h: 900 }, windows: [saved('/')] }))).toBeNull();
    expect(parseSession(raw({ viewport: { w: 1440, h: 900 }, windows: [] }))).toBeNull();
  });

  it('drops invalid windows and keeps the rest', () => {
    const session = parseSession(
      raw({
        viewport: { w: 1440, h: 900 },
        windows: [
          saved('//evil.example'),
          { ...saved('/eventos'), w: -1 },
          { ...saved('/feed'), x: 'a' },
          null,
          { ...saved('/'), minimized: 'yes', x: 10.6 },
        ],
      }),
    );
    expect(session?.windows).toEqual([saved('/', { x: 11 })]);
  });

  it('keeps only the frontmost windows when there are too many', () => {
    const windows = Array.from({ length: MAX_RESTORED_WINDOWS + 3 }, (_, i) => saved(`/p${i}`));
    const session = parseSession(raw({ viewport: { w: 1440, h: 900 }, windows }));
    expect(session?.windows).toHaveLength(MAX_RESTORED_WINDOWS);
    expect(session?.windows.at(-1)?.path).toBe(`/p${MAX_RESTORED_WINDOWS + 2}`);
  });
});

describe('toSession', () => {
  it('saves the windows from back to front, without ids or titles', () => {
    const windows = [live('win-1', '/'), live('win-2', '/feed', { minimized: true })];
    const session = toSession(windows, ['win-2', 'win-1'], { w: 1440, h: 900 });
    expect(session).toEqual({
      viewport: { w: 1440, h: 900 },
      windows: [saved('/feed', { minimized: true }), saved('/')],
    });
  });
});

describe('restoreOrder', () => {
  it('brings the window showing the current page to the front, visible', () => {
    const windows = [saved('/'), saved('/feed', { minimized: true }), saved('/eventos')];
    expect(restoreOrder(windows, '/feed')).toEqual({
      windows: [saved('/'), saved('/eventos'), saved('/feed')],
      matched: true,
    });
  });

  it('keeps the order when no window shows the current page', () => {
    const windows = [saved('/'), saved('/feed')];
    expect(restoreOrder(windows, '/miembros')).toEqual({ windows, matched: false });
  });
});
