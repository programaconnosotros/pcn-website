'use client';

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { findProgramForPath, visiblePrograms, type OsProgram } from './programs';
import { isOsMessage } from './os-env';
import { OsDock } from './os-dock';
import { OsLauncher } from './os-launcher';
import { OsMenuBar, type OsUser } from './os-menu-bar';
import { OsWallpaper } from './os-wallpaper';
import {
  MIN_WINDOW_HEIGHT,
  MIN_WINDOW_WIDTH,
  OsWindow,
  type OsWindowState,
  type Rect,
} from './os-window';
import { useOsMode } from './use-os-mode';

export const MENU_BAR_HEIGHT = 28;
/** Space kept free at the bottom of the screen for the dock. */
const DOCK_RESERVED_HEIGHT = 92;

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
  | { type: 'toggleMaximize'; id: string }
  | { type: 'rect'; id: string; rect: Rect }
  | { type: 'fit'; viewport: Viewport }
  | { type: 'location'; id: string; path: string; title: string | null };

const updateWindow = (
  state: OsState,
  id: string,
  update: (win: OsWindowState) => Partial<OsWindowState>,
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
    case 'toggleMaximize':
      return updateWindow(state, action.id, (win) => ({ maximized: !win.maximized }));
    case 'rect':
      return updateWindow(state, action.id, () => ({ ...action.rect, maximized: false }));
    case 'fit':
      return {
        ...state,
        windows: state.windows.map((win) => ({ ...win, ...fitToDesktop(win, action.viewport) })),
      };
    case 'location':
      return updateWindow(state, action.id, () => ({ path: action.path, title: action.title }));
  }
};

const desktopArea = (viewport: Viewport): Rect => ({
  x: 0,
  y: MENU_BAR_HEIGHT,
  w: viewport.w,
  h: viewport.h - MENU_BAR_HEIGHT - DOCK_RESERVED_HEIGHT,
});

/**
 * Size and position for a new window. It is deliberately smaller than the screen so the
 * wallpaper shows around it and people notice the window can be moved.
 */
const newWindowRect = (viewport: Viewport, openCount: number): Rect => {
  const area = desktopArea(viewport);
  const w = Math.max(MIN_WINDOW_WIDTH, Math.min(1180, Math.round(area.w * 0.78)));
  const h = Math.max(MIN_WINDOW_HEIGHT, Math.min(880, area.h - 40));
  const offset = (openCount % 6) * 28;
  return {
    x: Math.max(0, Math.round((area.w - w) / 2) + offset),
    y: area.y + 20 + offset,
    w,
    h: Math.min(h, area.y + area.h - (area.y + 20 + offset)),
  };
};

/** Keeps enough of the title bar on screen to grab the window again. */
const clampToDesktop = (rect: Rect, viewport: Viewport): Rect => ({
  ...rect,
  x: Math.min(Math.max(rect.x, 120 - rect.w), viewport.w - 120),
  y: Math.min(Math.max(rect.y, MENU_BAR_HEIGHT), viewport.h - 60),
});

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
  const [state, dispatch] = useReducer(reducer, { windows: [], order: [], nextId: 1 });
  const [viewport, setViewport] = useState<Viewport | null>(null);
  const [interacting, setInteracting] = useState(false);
  const [launcherOpen, setLauncherOpen] = useState(false);
  const iframes = useRef(new Map<string, HTMLIFrameElement>());
  const opened = useRef(false);

  const programs = useMemo(() => visiblePrograms(isAdmin), [isAdmin]);

  useEffect(() => {
    if (!isOs) return;
    const onResize = () => {
      const next = readViewport();
      setViewport(next);
      dispatch({ type: 'fit', viewport: next });
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [isOs]);

  // Open the page the visitor landed on (the home page by default) in the first window.
  useEffect(() => {
    if (!isOs || !viewport || opened.current) return;
    opened.current = true;
    dispatch({
      type: 'open',
      path: `${window.location.pathname}${window.location.search}`,
      rect: newWindowRect(viewport, 0),
    });
  }, [isOs, viewport]);

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
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [isOs, viewport]);

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

  const windowActions = focusedWindow
    ? {
        close: () => dispatch({ type: 'close', id: focusedWindow.id }),
        minimize: () => dispatch({ type: 'minimize', id: focusedWindow.id }),
        toggleMaximize: () => dispatch({ type: 'toggleMaximize', id: focusedWindow.id }),
        path: focusedWindow.path,
      }
    : null;

  return (
    <div className="hidden os:block">
      <div
        className={
          interacting
            ? 'fixed inset-0 select-none overflow-hidden [&_iframe]:pointer-events-none'
            : 'fixed inset-0 overflow-hidden'
        }
      >
        <OsWallpaper showHint={isOs && viewport !== null && state.windows.length === 0} />

        {isOs && viewport && (
          <AnimatePresence>
            {state.windows.map((win) => {
              const program = findProgramForPath(win.path);
              return (
                <OsWindow
                  key={win.id}
                  win={win}
                  program={program}
                  rect={win.maximized ? desktopArea(viewport) : win}
                  zIndex={10 + state.order.indexOf(win.id)}
                  focused={win.id === focusedId}
                  clampRect={(rect) => clampToDesktop(rect, viewport)}
                  onFocus={() => {
                    if (state.order.at(-1) !== win.id) dispatch({ type: 'focus', id: win.id });
                  }}
                  onClose={() => dispatch({ type: 'close', id: win.id })}
                  onMinimize={() => dispatch({ type: 'minimize', id: win.id })}
                  onToggleMaximize={() => dispatch({ type: 'toggleMaximize', id: win.id })}
                  onRectChange={(rect) => dispatch({ type: 'rect', id: win.id, rect })}
                  onInteractionChange={setInteracting}
                  registerIframe={(iframe) => {
                    if (iframe) iframes.current.set(win.id, iframe);
                    else iframes.current.delete(win.id);
                  }}
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
          </AnimatePresence>
        )}

        <OsMenuBar
          user={user}
          focusedProgram={focusedProgram}
          windowActions={windowActions}
          onOpenProgram={openProgram}
          onOpenLauncher={() => setLauncherOpen(true)}
        />

        <OsDock
          programs={programs}
          runningPrograms={runningPrograms}
          runningProgramIds={runningProgramIds}
          onOpenProgram={openProgram}
          onOpenLauncher={() => setLauncherOpen(true)}
        />

        <OsLauncher
          open={launcherOpen}
          programs={programs}
          onOpenProgram={(program) => {
            setLauncherOpen(false);
            openProgram(program);
          }}
          onClose={() => setLauncherOpen(false)}
        />
      </div>
    </div>
  );
}
