'use client';

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { findMusicSet } from '@/components/music/music-sets';
import { useMusicPlayer } from '@/components/music/use-music-player';
import { cn } from '@/lib/utils';
import { findProgramForPath, visiblePrograms, type OsProgram } from './programs';
import { GlobalSearch, openGlobalSearch } from '@/components/search/global-search';
import { useDisplayMode } from './os-display-mode';
import { isOsHost, isOsMessage } from './os-env';
import { dockReservedHeight } from './os-dock-geometry';
import { OsMenuBar, type OsUser } from './os-menu-bar';
import { OsWallpaper } from './os-wallpaper';
import {
  MIN_WINDOW_HEIGHT,
  MIN_WINDOW_WIDTH,
  type ClampMode,
  type OsWindowState,
  type Rect,
} from './os-window-geometry';
import { useOsMode } from './use-os-mode';

const MENU_BAR_HEIGHT = 28;
/** PCN OS liviano keeps at most this many windows with their page loaded; the rest sleep. */
const LITE_LIVE_WINDOWS = 3;

type OsDesktopParts = typeof import('./os-desktop-parts');

let desktopParts: Promise<OsDesktopParts> | null = null;
const loadDesktopParts = () => (desktopParts ??= import('./os-desktop-parts'));

// On a desktop host, start downloading right away, while the page is still hydrating, so the
// dock and the first window show up as early as before. Elsewhere it is never requested.
if (typeof window !== 'undefined' && isOsHost()) void loadDesktopParts();

/** The heavy desktop components, once the desktop is active and they have loaded. */
const useDesktopParts = (enabled: boolean) => {
  const [parts, setParts] = useState<OsDesktopParts | null>(null);
  useEffect(() => {
    if (!enabled || parts) return;
    let cancelled = false;
    void loadDesktopParts().then((loaded) => {
      if (!cancelled) setParts(loaded);
    });
    return () => {
      cancelled = true;
    };
  }, [enabled, parts]);
  return parts;
};

interface Viewport {
  w: number;
  h: number;
}

interface OsState {
  windows: OsWindowState[];
  /** Window ids from back to front. */
  order: string[];
  nextId: number;
}

type OsAction =
  | { type: 'open'; path: string; rect: Rect }
  /** Opens a page in a new window, or brings forward the window already showing it. */
  | { type: 'openPath'; path: string; viewport: Viewport }
  | { type: 'focus'; id: string }
  | { type: 'close'; id: string }
  | { type: 'minimize'; id: string }
  /** Clicking the desktop hides every window, like "show desktop". */
  | { type: 'minimizeAll' }
  | { type: 'toggleMaximize'; id: string }
  | { type: 'rect'; id: string; rect: Rect }
  /** The screen changed size: windows keep their share of the desktop. */
  | { type: 'fit'; from: Viewport; to: Viewport }
  | { type: 'location'; id: string; path: string; title: string | null };

const updateWindow = (
  state: OsState,
  id: string,
  update: (_win: OsWindowState) => Partial<OsWindowState>,
): OsState => ({
  ...state,
  windows: state.windows.map((win) => (win.id === id ? { ...win, ...update(win) } : win)),
});

const bringToFront = (order: string[], id: string) => [...order.filter((o) => o !== id), id];

const reducer = (state: OsState, action: OsAction): OsState => {
  switch (action.type) {
    case 'open': {
      const id = `win-${state.nextId}`;
      const win: OsWindowState = {
        id,
        src: action.path,
        path: action.path,
        title: null,
        minimized: false,
        maximized: false,
        ...action.rect,
      };
      return {
        windows: [...state.windows, win],
        order: [...state.order, id],
        nextId: state.nextId + 1,
      };
    }
    case 'openPath': {
      const existing = [...state.order]
        .reverse()
        .find((id) => state.windows.find((win) => win.id === id)?.path === action.path);
      if (existing) return reducer(state, { type: 'focus', id: existing });
      return reducer(state, {
        type: 'open',
        path: action.path,
        rect: newWindowRect(action.viewport, state.windows.length),
      });
    }
    case 'focus':
      return {
        ...updateWindow(state, action.id, () => ({ minimized: false })),
        order: bringToFront(state.order, action.id),
      };
    case 'close':
      return {
        ...state,
        windows: state.windows.filter((win) => win.id !== action.id),
        order: state.order.filter((id) => id !== action.id),
      };
    case 'minimize':
      return updateWindow(state, action.id, () => ({ minimized: true }));
    case 'minimizeAll':
      return { ...state, windows: state.windows.map((win) => ({ ...win, minimized: true })) };
    case 'toggleMaximize':
      return updateWindow(state, action.id, (win) => ({ maximized: !win.maximized }));
    case 'rect':
      return updateWindow(state, action.id, () => ({ ...action.rect, maximized: false }));
    case 'fit':
      return {
        ...state,
        windows: state.windows.map((win) => ({
          ...win,
          ...fitToDesktop(scaleToDesktop(win, action.from, action.to), action.to),
        })),
      };
    case 'location':
      return updateWindow(state, action.id, () => ({ path: action.path, title: action.title }));
  }
};

const desktopArea = (viewport: Viewport): Rect => ({
  x: 0,
  y: MENU_BAR_HEIGHT,
  w: viewport.w,
  h: viewport.h - MENU_BAR_HEIGHT - dockReservedHeight(),
});

/**
 * Size and position for a new window. It takes the whole height between the menu bar and the
 * dock, but is narrower than the screen so the wallpaper shows at its sides and people notice
 * the window can be moved.
 */
const newWindowRect = (viewport: Viewport, openCount: number): Rect => {
  const area = desktopArea(viewport);
  const w = Math.max(MIN_WINDOW_WIDTH, Math.min(1180, Math.round(area.w * 0.78)));
  // Each new window cascades sideways from the previous one, keeping the full height.
  const step = openCount % 6;
  return {
    x: Math.max(0, Math.min(Math.round((area.w - w) / 2) + step * 28, area.w - w)),
    y: area.y,
    w,
    h: Math.max(MIN_WINDOW_HEIGHT, area.h),
  };
};

const WINDOW_GAP = 12;
/** Narrowest desktop that fits the home and the feed side by side. */
const SPLIT_MIN_WIDTH = 1200;

/**
 * Landing on the home page opens it a bit to the left, with the feed in a narrower window at its
 * right. Null when the desktop is too narrow for both, so the home opens alone as usual.
 */
const homeAndFeedRects = (viewport: Viewport): { home: Rect; feed: Rect } | null => {
  const area = desktopArea(viewport);
  if (area.w < SPLIT_MIN_WIDTH) return null;
  const homeW = Math.min(1180, Math.round(area.w * 0.62));
  const feedW = Math.min(520, area.w - homeW - WINDOW_GAP * 3);
  const x = Math.round((area.w - homeW - WINDOW_GAP - feedW) / 2);
  const h = Math.max(MIN_WINDOW_HEIGHT, area.h);
  return {
    home: { x, y: area.y, w: homeW, h },
    feed: { x: x + homeW + WINDOW_GAP, y: area.y, w: feedW, h },
  };
};

/**
 * Keeps the whole window inside the desktop, between the menu bar and the dock, so its title
 * bar and controls can never end up hidden. Moving slides the window back in; resizing stops
 * the dragged edge at the border of the desktop instead.
 */
const clampToDesktop = (rect: Rect, viewport: Viewport, mode: ClampMode): Rect => {
  const area = desktopArea(viewport);
  if (mode === 'move') return fitToDesktop(rect, viewport);
  const left = Math.max(rect.x, area.x);
  const top = Math.max(rect.y, area.y);
  const right = Math.min(rect.x + rect.w, area.x + area.w);
  const bottom = Math.min(rect.y + rect.h, area.y + area.h);
  return fitToDesktop({ x: left, y: top, w: right - left, h: bottom - top }, viewport);
};

/**
 * Scales a window with the desktop when the screen changes size, so it keeps the same share
 * of it (and the same place) whether the screen grows or shrinks.
 */
const scaleToDesktop = (rect: Rect, from: Viewport, to: Viewport): Rect => {
  const before = desktopArea(from);
  const after = desktopArea(to);
  const sx = after.w / before.w;
  const sy = after.h / before.h;
  return {
    x: Math.round(after.x + (rect.x - before.x) * sx),
    y: Math.round(after.y + (rect.y - before.y) * sy),
    w: Math.round(rect.w * sx),
    h: Math.round(rect.h * sy),
  };
};

/** Shrinks and moves a window so it fits the desktop after the screen gets smaller. */
const fitToDesktop = (rect: Rect, viewport: Viewport): Rect => {
  const area = desktopArea(viewport);
  const w = Math.max(MIN_WINDOW_WIDTH, Math.min(rect.w, area.w));
  const h = Math.max(MIN_WINDOW_HEIGHT, Math.min(rect.h, area.h));
  return {
    w,
    h,
    x: Math.max(0, Math.min(rect.x, area.w - w)),
    y: Math.max(area.y, Math.min(rect.y, area.y + area.h - h)),
  };
};

const readViewport = (): Viewport => ({ w: window.innerWidth, h: window.innerHeight });

interface PcnOsProps {
  user: OsUser | null;
  isAdmin: boolean;
}

/**
 * The PCN OS desktop: on large screens the site becomes a desktop with a menu bar, a dock and
 * movable windows. Each window is an iframe of a real page, so pages keep their own scroll,
 * dialogs and responsive layout at the window's size.
 */
export function PcnOs({ user, isAdmin }: PcnOsProps) {
  const isOs = useOsMode();
  const parts = useDesktopParts(isOs);
  const lite = useDisplayMode() === 'lite';
  const [state, dispatch] = useReducer(reducer, { windows: [], order: [], nextId: 1 });
  const [viewport, setViewport] = useState<Viewport | null>(null);
  /** Cursor to show while a window is being moved or resized; null when idle. */
  const [interactionCursor, setInteractionCursor] = useState<string | null>(null);
  const [launcherOpen, setLauncherOpen] = useState(false);
  const musicPlayer = useMusicPlayer();
  const { play: playMusic } = musicPlayer;
  const iframes = useRef(new Map<string, HTMLIFrameElement>());
  const opened = useRef(false);

  const programs = useMemo(() => visiblePrograms(isAdmin), [isAdmin]);

  useEffect(() => {
    if (!isOs) return;
    let current = readViewport();
    setViewport(current);
    dispatch({ type: 'fit', from: current, to: current });
    const onResize = () => {
      const next = readViewport();
      setViewport(next);
      dispatch({ type: 'fit', from: current, to: next });
      current = next;
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [isOs]);

  // Open the page the visitor landed on (the home page by default) in the first window, and the
  // feed next to the home.
  useEffect(() => {
    if (!isOs || !viewport || opened.current) return;
    opened.current = true;
    const path = `${window.location.pathname}${window.location.search}`;
    // PCN OS liviano opens only the home: every window is a whole copy of the site.
    const split = path === '/' && !lite ? homeAndFeedRects(viewport) : null;
    if (split) {
      // The feed opens first so the home ends up in front, focused and in the address bar.
      dispatch({ type: 'open', path: '/feed', rect: split.feed });
      dispatch({ type: 'open', path, rect: split.home });
      return;
    }
    dispatch({ type: 'open', path, rect: newWindowRect(viewport, 0) });
  }, [isOs, viewport, lite]);

  const focusedId = [...state.order]
    .reverse()
    .find((id) => !state.windows.find((win) => win.id === id)?.minimized);
  const focusedWindow = state.windows.find((win) => win.id === focusedId) ?? null;
  const focusedProgram = focusedWindow ? findProgramForPath(focusedWindow.path) : null;

  // Keep the address bar and tab title in sync with the focused window so links can be shared.
  const focusedPath = focusedWindow?.path;
  const focusedProgramName = focusedProgram?.name;
  useEffect(() => {
    if (!isOs || !focusedPath) return;
    const current = `${window.location.pathname}${window.location.search}`;
    if (current !== focusedPath) window.history.replaceState(null, '', focusedPath);
    document.title = `${focusedProgramName} - PCN OS`;
  }, [isOs, focusedPath, focusedProgramName]);

  useEffect(() => {
    if (!isOs) return;
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || !isOsMessage(event.data)) return;
      const id = [...iframes.current].find(([, f]) => f.contentWindow === event.source)?.[0];
      if (!id) return;
      if (event.data.type === 'focus') dispatch({ type: 'focus', id });
      if (event.data.type === 'location')
        dispatch({ type: 'location', id, path: event.data.path, title: event.data.title });
      if (event.data.type === 'open' && viewport)
        dispatch({ type: 'openPath', path: event.data.path, viewport });
      if (event.data.type === 'search') openGlobalSearch(event.data.query);
      if (event.data.type === 'playMusic') {
        const set = findMusicSet(event.data.id);
        if (set) playMusic(set);
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [isOs, viewport, playMusic]);

  const openProgram = useCallback(
    (program: OsProgram) => {
      if (!viewport) return;
      const topmostFirst = [...state.order].reverse();
      const existing = topmostFirst.find((id) => {
        const win = state.windows.find((w) => w.id === id);
        return win && findProgramForPath(win.path).id === program.id;
      });
      if (existing) {
        dispatch({ type: 'focus', id: existing });
        return;
      }
      dispatch({
        type: 'open',
        path: program.url,
        rect: newWindowRect(viewport, state.windows.length),
      });
    },
    [viewport, state.order, state.windows],
  );

  const runningProgramIds = new Set(state.windows.map((win) => findProgramForPath(win.path).id));
  const runningPrograms = state.windows
    .map((win) => findProgramForPath(win.path))
    .filter((program, index, all) => all.findIndex((a) => a.id === program.id) === index);

  // A maximized window hides the desktop, so its background widgets can pause.
  const covered = state.windows.some((win) => win.maximized && !win.minimized);
  // Wallpaper and menu bar render from the start (they are what the server paints); the rest
  // waits for the desktop parts, which arrive like they used to after hydration.
  const desktop = isOs ? parts : null;
  // PCN OS liviano: only the most recently focused windows that are on screen keep their page.
  const liveWindowIds = new Set(
    state.order
      .filter((id) => !state.windows.find((win) => win.id === id)?.minimized)
      .slice(-LITE_LIVE_WINDOWS),
  );

  return (
    <div className="hidden os:block">
      <div className={cn('fixed inset-0 overflow-hidden', interactionCursor && 'select-none')}>
        <OsWallpaper
          showHint={desktop !== null && viewport !== null && state.windows.length === 0}
          onPointerDown={() => dispatch({ type: 'minimizeAll' })}
        />
        {desktop && !lite && <desktop.OsProcesses covered={covered} />}
        {desktop && !lite && viewport && (
          <desktop.OsPhotos
            covered={covered}
            onOpen={(path) => dispatch({ type: 'openPath', path, viewport })}
          />
        )}

        {desktop && viewport && (
          <desktop.AnimatePresence>
            {state.windows.map((win) => {
              const program = findProgramForPath(win.path);
              return (
                <desktop.OsWindow
                  key={win.id}
                  win={win}
                  program={program}
                  rect={win.maximized ? desktopArea(viewport) : win}
                  zIndex={10 + state.order.indexOf(win.id)}
                  focused={win.id === focusedId}
                  clampRect={(rect, mode) => clampToDesktop(rect, viewport, mode)}
                  onFocus={() => {
                    if (state.order.at(-1) !== win.id) dispatch({ type: 'focus', id: win.id });
                  }}
                  onClose={() => dispatch({ type: 'close', id: win.id })}
                  onMinimize={() => dispatch({ type: 'minimize', id: win.id })}
                  onToggleMaximize={() => dispatch({ type: 'toggleMaximize', id: win.id })}
                  onRectChange={(rect) => dispatch({ type: 'rect', id: win.id, rect })}
                  onInteractionChange={setInteractionCursor}
                  registerIframe={(iframe) => {
                    if (iframe) iframes.current.set(win.id, iframe);
                    else iframes.current.delete(win.id);
                  }}
                  lite={lite}
                  suspended={lite && !liveWindowIds.has(win.id)}
                  onIframeLoad={() => {
                    // Full page loads (e.g. auth pages outside the platform) don't run the bridge.
                    try {
                      const iframe = iframes.current.get(win.id);
                      const location = iframe?.contentWindow?.location;
                      if (location)
                        dispatch({
                          type: 'location',
                          id: win.id,
                          path: `${location.pathname}${location.search}`,
                          title: iframe?.contentDocument?.title ?? null,
                        });
                    } catch {
                      // The window navigated to another origin; keep the last known location.
                    }
                  }}
                />
              );
            })}
          </desktop.AnimatePresence>
        )}

        {/* While a window is moved or resized, this shield sits over every iframe so the pointer
            never gets swallowed by one. Toggling pointer-events on the iframes themselves instead
            leaves Safari unable to scroll them afterwards. */}
        {interactionCursor && (
          <div
            aria-hidden
            className="absolute inset-0 z-[2147483647]"
            style={{ cursor: interactionCursor }}
          />
        )}

        <OsMenuBar
          user={user}
          focusedProgram={focusedProgram}
          musicPlayer={musicPlayer}
          onOpenProgram={openProgram}
          onOpenPath={(path) => viewport && dispatch({ type: 'openPath', path, viewport })}
          onOpenLauncher={() => setLauncherOpen(true)}
        />

        {desktop && (
          <desktop.OsDock
            programs={programs}
            runningPrograms={runningPrograms}
            runningProgramIds={runningProgramIds}
            focusedProgramId={focusedProgram?.id ?? null}
            onOpenProgram={openProgram}
            onOpenLauncher={() => setLauncherOpen(true)}
            lite={lite}
          />
        )}

        {desktop && <desktop.OsPerformanceNotice />}

        {desktop && (
          <desktop.OsLauncher
            open={launcherOpen}
            programs={programs}
            onOpenProgram={(program) => {
              setLauncherOpen(false);
              openProgram(program);
            }}
            onClose={() => setLauncherOpen(false)}
          />
        )}

        {isOs && viewport && (
          <GlobalSearch
            // Above the windows, the dock, the menu bar and the launcher.
            layerClassName="z-[6500]"
            onNavigate={(path) => dispatch({ type: 'openPath', path, viewport })}
          />
        )}

        {desktop && musicPlayer.current && (
          <desktop.BackgroundMusicPlayer
            set={musicPlayer.current}
            open={musicPlayer.open}
            onClose={musicPlayer.hide}
            iframeRef={musicPlayer.iframeRef}
            onIframeLoad={musicPlayer.onIframeLoad}
          />
        )}
      </div>
    </div>
  );
}
