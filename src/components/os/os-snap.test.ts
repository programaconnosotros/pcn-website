import { MIN_WINDOW_WIDTH, type OsWindowState } from './os-window-geometry';
import { SNAP_GAP, clampDivider, snapRect, snapZoneAt, snappedPair, splitRects } from './os-snap';

const area = { x: 0, y: 28, w: 1600, h: 800 };

const win = (id: string, extra: Partial<OsWindowState> = {}): OsWindowState => ({
  id,
  src: '/',
  path: '/',
  title: null,
  minimized: false,
  maximized: false,
  x: 100,
  y: 28,
  w: 800,
  h: 800,
  ...extra,
});

describe('snapZoneAt', () => {
  it('snaps at the side edges and maximizes against the menu bar', () => {
    expect(snapZoneAt(0, 400, 1600, 28)).toBe('left');
    expect(snapZoneAt(12, 400, 1600, 28)).toBe('left');
    expect(snapZoneAt(1599, 400, 1600, 28)).toBe('right');
    expect(snapZoneAt(800, 10, 1600, 28)).toBe('top');
    expect(snapZoneAt(800, 400, 1600, 28)).toBeNull();
  });
});

describe('splitRects', () => {
  it('splits the desktop in two halves with a gap between them', () => {
    const { left, right } = splitRects(area);
    expect(left).toEqual({ x: 0, y: 28, w: 800 - SNAP_GAP / 2, h: 800 });
    expect(right).toEqual({ x: 800 + SNAP_GAP / 2, y: 28, w: 800 - SNAP_GAP / 2, h: 800 });
    expect(left.w + SNAP_GAP + right.w).toBe(area.w);
  });

  it('never makes a half narrower than a window can be', () => {
    expect(clampDivider(10, area)).toBe(MIN_WINDOW_WIDTH + SNAP_GAP / 2);
    expect(clampDivider(1590, area)).toBe(1600 - MIN_WINDOW_WIDTH - SNAP_GAP / 2);
    expect(splitRects(area, 0).left.w).toBe(MIN_WINDOW_WIDTH);
  });
});

describe('snapRect', () => {
  it('takes half the desktop when nothing else is snapped', () => {
    expect(snapRect('right', area, [win('a')], ['a'], 'a')).toEqual(splitRects(area).right);
  });

  it('fills what the window snapped to the other side leaves', () => {
    const left = win('a', { x: 0, w: 1000 - SNAP_GAP / 2, snap: 'left' });
    const rect = snapRect('right', area, [left, win('b')], ['a', 'b'], 'b');
    expect(rect.x).toBe(1000 + SNAP_GAP / 2);
    expect(rect.x + rect.w).toBe(1600);
  });

  it('ignores minimized windows on the other side', () => {
    const left = win('a', { x: 0, w: 1000, snap: 'left', minimized: true });
    expect(snapRect('right', area, [left, win('b')], ['a', 'b'], 'b')).toEqual(
      splitRects(area).right,
    );
  });
});

describe('snappedPair', () => {
  it('finds two windows that meet at the divider', () => {
    const { left, right } = splitRects(area);
    const a = win('a', { ...left, snap: 'left' });
    const b = win('b', { ...right, snap: 'right' });
    expect(snappedPair([a, b], ['a', 'b'])).toEqual({ left: a, right: b, dividerX: 800 });
  });

  it('is null without both sides or when they no longer meet', () => {
    const { left, right } = splitRects(area);
    const a = win('a', { ...left, snap: 'left' });
    expect(snappedPair([a], ['a'])).toBeNull();
    const far = win('b', { ...right, x: right.x + 100, snap: 'right' });
    expect(snappedPair([a, far], ['a', 'b'])).toBeNull();
  });
});
