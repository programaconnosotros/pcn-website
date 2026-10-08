'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Copy, ExternalLink, Minus, RotateCw, Square, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  MIN_WINDOW_HEIGHT,
  MIN_WINDOW_WIDTH,
  type ClampMode,
  type OsWindowState,
  type Rect,
} from './os-window-geometry';
import type { OsProgram } from './programs';
import type { SnapZone } from './os-snap';
import { PcnLoader } from '@/components/ui/pcn-loader';
import { tabTitleSubject } from '@/lib/tab-title';

type ResizeDirection = 'n' | 'e' | 's' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

const resizeCursors: Record<ResizeDirection, string> = {
  n: 'ns-resize',
  s: 'ns-resize',
  e: 'ew-resize',
  w: 'ew-resize',
  nw: 'nwse-resize',
  se: 'nwse-resize',
  ne: 'nesw-resize',
  sw: 'nesw-resize',
};

interface OsWindowProps {
  win: OsWindowState;
  program: OsProgram;
  /** Where the window is drawn. Differs from the stored rect when the window is maximized. */
  rect: Rect;
  zIndex: number;
  focused: boolean;
  /** Keeps the window inside the desktop: returns a rect clamped to it. */
  clampRect: (_rect: Rect, _mode: ClampMode) => Rect;
  onFocus: () => void;
  onClose: () => void;
  onMinimize: () => void;
  onToggleMaximize: () => void;
  onRectChange: (_rect: Rect) => void;
  /** Where the window would snap with the pointer at (x, y) on the screen, if anywhere. */
  snapZoneAt?: (_x: number, _y: number) => SnapZone | null;
  /** Shows (or, with null, hides) where the window would snap if dropped now. */
  onSnapPreview?: (_zone: SnapZone | null) => void;
  /** Dropped against an edge: snap to that half, or maximize at the top. */
  onSnap?: (_zone: SnapZone) => void;
  /** Called with the cursor to show while moving or resizing, and with null when done. */
  onInteractionChange: (_cursor: string | null) => void;
  registerIframe: (_iframe: HTMLIFrameElement | null) => void;
  onIframeLoad: () => void;
  /** PCN OS liviano: no open/close/minimize animations and no large shadows. */
  lite?: boolean;
  /**
   * Its page is unloaded to save resources (PCN OS liviano keeps only the most recent windows
   * live). It loads again, where it was, when the window comes back to the front.
   */
  suspended?: boolean;
}

/** Two title bar presses this close in time and space are a double click (maximize/restore). */
const DOUBLE_CLICK_MS = 500;
const DOUBLE_CLICK_SLOP = 4;

/**
 * Follows the pointer until it is released, reporting the delta from where it started at most
 * once per frame (pointer events can fire several times per frame on high-rate mice).
 */
const trackPointer = (
  event: React.PointerEvent,
  onMove: (_dx: number, _dy: number) => void,
  onEnd: () => void,
) => {
  const startX = event.clientX;
  const startY = event.clientY;
  let frame = 0;
  let last: PointerEvent | null = null;
  const flush = () => {
    frame = 0;
    if (last) onMove(last.clientX - startX, last.clientY - startY);
    last = null;
  };
  const move = (e: PointerEvent) => {
    last = e;
    frame ||= requestAnimationFrame(flush);
  };
  const up = () => {
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', up);
    window.removeEventListener('pointercancel', up);
    cancelAnimationFrame(frame);
    flush();
    onEnd();
  };
  window.addEventListener('pointermove', move);
  window.addEventListener('pointerup', up);
  window.addEventListener('pointercancel', up);
};

/**
 * Square "traffic lights": small outlined LEDs that reveal their glyph when the
 * pointer is over the control group, like a desktop OS but on the terminal palette.
 */
const WindowButton = ({
  label,
  icon: Icon,
  focused,
  danger,
  onClick,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  focused: boolean;
  danger?: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    onPointerDown={(e) => e.stopPropagation()}
    onDoubleClick={(e) => e.stopPropagation()}
    onClick={onClick}
    className={cn(
      'group/btn flex size-[18px] items-center justify-center outline-hidden transition-[filter] duration-200',
      danger
        ? 'hover:drop-shadow-[0_0_6px_rgba(248,113,113,0.9)] focus-visible:drop-shadow-[0_0_6px_rgba(248,113,113,0.9)]'
        : 'hover:drop-shadow-[0_0_6px_rgba(4,244,190,0.9)] focus-visible:drop-shadow-[0_0_6px_rgba(4,244,190,0.9)]',
    )}
  >
    {/* Chamfered corners give the controls a HUD look; the glow lives on the button's filter. */}
    <span
      className={cn(
        'flex size-full items-center justify-center border transition-all duration-200 [clip-path:polygon(0_0,calc(100%-4px)_0,100%_4px,100%_100%,4px_100%,0_calc(100%-4px))]',
        focused
          ? 'border-pcnGreen-500 bg-pcnGreen-100 text-pcnGreen'
          : 'border-pcnGreen-300 text-pcnGreen-500',
        danger
          ? 'group-hover/btn:border-red-400 group-hover/btn:bg-red-500 group-hover/btn:text-black'
          : 'group-hover/btn:border-pcnGreen group-hover/btn:bg-pcnGreen group-hover/btn:text-black',
        'group-active/btn:scale-90',
      )}
    >
      <Icon
        strokeWidth={2.5}
        className={cn(
          'size-2.5 transition-transform duration-200',
          danger ? 'group-hover/btn:rotate-90' : 'group-hover/btn:scale-125',
        )}
      />
    </span>
  </button>
);

// Handles sit just inside the frame because the window clips its overflow for rounded corners.
// The top ones are thin so the title bar buttons stay clickable.
const resizeHandles: { direction: ResizeDirection; className: string }[] = [
  { direction: 'n', className: 'top-0 left-2 right-2 h-1 cursor-ns-resize' },
  { direction: 'e', className: 'right-0 top-2 bottom-3 w-1.5 cursor-ew-resize' },
  { direction: 'w', className: 'left-0 top-2 bottom-3 w-1.5 cursor-ew-resize' },
  { direction: 's', className: 'bottom-0 left-3 right-3 h-1.5 cursor-ns-resize' },
  { direction: 'nw', className: 'top-0 left-0 size-2 cursor-nwse-resize' },
  { direction: 'ne', className: 'top-0 right-0 size-2 cursor-nesw-resize' },
  { direction: 'se', className: 'bottom-0 right-0 size-3 cursor-nwse-resize' },
  { direction: 'sw', className: 'bottom-0 left-0 size-3 cursor-nesw-resize' },
];

export function OsWindow({
  win,
  program,
  rect,
  zIndex,
  focused,
  clampRect,
  onFocus,
  onClose,
  onMinimize,
  onToggleMaximize,
  onRectChange,
  snapZoneAt,
  onSnapPreview,
  onSnap,
  onInteractionChange,
  registerIframe,
  onIframeLoad,
  lite = false,
  suspended = false,
}: OsWindowProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [loaded, setLoaded] = useState(false);
  // Where the page loads from. A suspended window resumes at the page it was on, not the one it
  // was opened with (the iframe keeps `src` fixed while it navigates, to avoid reloads).
  const [src, setSrc] = useState(win.src);
  const [prevSuspended, setPrevSuspended] = useState(suspended);
  if (suspended !== prevSuspended) {
    setPrevSuspended(suspended);
    if (suspended) {
      setSrc(win.path);
      setLoaded(false);
    }
  }

  // The iframe's `load` event waits for the whole streamed page and every image in it. The page
  // shell (or its loading skeleton) paints long before that, so the loader goes away as soon as
  // the embedded document has anything in its body.
  useEffect(() => {
    if (loaded || suspended) return;
    const interval = window.setInterval(() => {
      try {
        const doc = iframeRef.current?.contentDocument;
        if (doc && doc.URL !== 'about:blank' && doc.body?.childElementCount) setLoaded(true);
      } catch {
        // Not readable (another origin): wait for the load event instead.
      }
    }, 50);
    return () => window.clearInterval(interval);
  }, [loaded, suspended]);
  const Icon = program.icon;
  // The title bar already shows the program's ~/dir; the page's terminal-style tab title adds
  // what's open inside it (`cat ~/eventos/meetup` → `meetup`).
  const subtitle = tabTitleSubject(win.title);

  const sectionRef = useRef<HTMLElement | null>(null);
  /** A move or resize ended after being previewed on the DOM; React has to take it back. */
  const settling = useRef(false);

  // While the pointer moves, the window is updated on the DOM directly instead of through React:
  // the desktop and every other window would re-render on each frame otherwise. Once released,
  // the final rect goes to the reducer and this hands the styles back to React.
  useLayoutEffect(() => {
    const el = sectionRef.current;
    if (!settling.current || !el) return;
    settling.current = false;
    el.style.translate = '';
    el.style.left = `${rect.x}px`;
    el.style.top = `${rect.y}px`;
    el.style.width = `${rect.w}px`;
    el.style.height = `${rect.h}px`;
  });

  /** Moves are previewed with `translate` (no layout); resizes need the real size. */
  const preview = (next: Rect, mode: ClampMode) => {
    const el = sectionRef.current;
    if (!el) return;
    if (mode === 'move') {
      el.style.translate = `${next.x - rect.x}px ${next.y - rect.y}px`;
      el.style.width = `${next.w}px`;
      el.style.height = `${next.h}px`;
      return;
    }
    el.style.left = `${next.x}px`;
    el.style.top = `${next.y}px`;
    el.style.width = `${next.w}px`;
    el.style.height = `${next.h}px`;
  };

  /** When and where the title bar was last pressed, to tell a double click from a drag. */
  const lastPress = useRef<{ time: number; x: number; y: number } | null>(null);

  const startDrag = (event: React.PointerEvent) => {
    if (event.button !== 0) return;
    onFocus();
    // A double click is detected here instead of with onDoubleClick: the first press puts the
    // interaction shield over the page, so its release (and the dblclick) never reach the header.
    const now = performance.now();
    const previous = lastPress.current;
    if (
      previous &&
      now - previous.time <= DOUBLE_CLICK_MS &&
      Math.abs(event.clientX - previous.x) <= DOUBLE_CLICK_SLOP &&
      Math.abs(event.clientY - previous.y) <= DOUBLE_CLICK_SLOP
    ) {
      lastPress.current = null;
      onToggleMaximize();
      return;
    }
    lastPress.current = { time: now, x: event.clientX, y: event.clientY };
    // Dragging a maximized window restores it under the pointer, like a desktop OS does.
    const ratio = (event.clientX - rect.x) / rect.w;
    const start: Rect = win.maximized
      ? { ...win, x: Math.round(event.clientX - win.w * ratio), y: rect.y }
      : rect;
    let latest: Rect | null = null;
    let zone: SnapZone | null = null;
    const pointerX = event.clientX;
    const pointerY = event.clientY;
    onInteractionChange('default');
    trackPointer(
      event,
      (dx, dy) => {
        latest = clampRect({ ...start, x: start.x + dx, y: start.y + dy }, 'move');
        preview(latest, 'move');
        const next = snapZoneAt?.(pointerX + dx, pointerY + dy) ?? null;
        if (next !== zone) {
          zone = next;
          onSnapPreview?.(zone);
        }
      },
      () => {
        onInteractionChange(null);
        if (!latest) return;
        settling.current = true;
        if (zone) {
          onSnapPreview?.(null);
          onSnap?.(zone);
          return;
        }
        onRectChange(latest);
      },
    );
  };

  const startResize = (event: React.PointerEvent, direction: ResizeDirection) => {
    if (event.button !== 0) return;
    event.stopPropagation();
    onFocus();
    const start = rect;
    let latest: Rect | null = null;
    onInteractionChange(resizeCursors[direction]);
    trackPointer(
      event,
      (dx, dy) => {
        const next = { ...start };
        if (direction.includes('e')) next.w = Math.max(MIN_WINDOW_WIDTH, start.w + dx);
        if (direction.includes('w')) {
          next.w = Math.max(MIN_WINDOW_WIDTH, start.w - dx);
          next.x = start.x + start.w - next.w;
        }
        if (direction.includes('s')) next.h = Math.max(MIN_WINDOW_HEIGHT, start.h + dy);
        if (direction.includes('n')) {
          next.h = Math.max(MIN_WINDOW_HEIGHT, start.h - dy);
          next.y = start.y + start.h - next.h;
        }
        latest = clampRect(next, 'resize');
        preview(latest, 'resize');
      },
      () => {
        onInteractionChange(null);
        if (!latest) return;
        settling.current = true;
        onRectChange(latest);
      },
    );
  };

  return (
    <motion.section
      ref={sectionRef}
      role="dialog"
      aria-label={program.name}
      data-focused={focused}
      initial={lite ? false : { opacity: 0, scale: 0.94, y: 16 }}
      // Once minimized, `visibility: hidden` stops the browser painting the window and its page
      // (opacity 0 alone keeps compositing it). Restoring shows it before fading back in.
      animate={
        lite
          ? win.minimized
            ? { opacity: 0, transition: { duration: 0 }, transitionEnd: { visibility: 'hidden' } }
            : { opacity: 1, visibility: 'visible', transition: { duration: 0 } }
          : win.minimized
            ? {
                opacity: 0,
                scale: 0.4,
                y: 480,
                transition: { duration: 0.25, ease: 'easeIn' },
                transitionEnd: { visibility: 'hidden' },
              }
            : {
                opacity: 1,
                scale: 1,
                y: 0,
                visibility: 'visible',
                transition: { duration: 0.22, ease: 'easeOut' },
              }
      }
      exit={
        lite
          ? { opacity: 0, transition: { duration: 0 } }
          : { opacity: 0, scale: 0.92, transition: { duration: 0.15 } }
      }
      onPointerDownCapture={onFocus}
      style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h, zIndex }}
      className={cn(
        'absolute flex flex-col overflow-hidden rounded-md border bg-background shadow-[0_30px_80px_-20px_rgba(0,0,0,0.85)]',
        focused
          ? 'border-pcnGreen-500 shadow-[0_0_40px_-12px_#04f4be80,0_30px_80px_-20px_rgba(0,0,0,0.85)]'
          : 'border-pcnGreen-200',
        win.maximized && 'rounded-none border-x-0',
        win.minimized && 'pointer-events-none',
        lite && 'shadow-none',
      )}
    >
      <header
        onPointerDown={startDrag}
        className={cn(
          'relative flex h-7 shrink-0 cursor-default touch-none items-center border-b bg-black px-1.5 font-mono select-none',
          focused ? 'border-pcnGreen-400' : 'border-pcnGreen-200',
        )}
      >
        <div className="flex items-center gap-1 pl-0.5">
          <WindowButton label="Cerrar" icon={X} focused={focused} danger onClick={onClose} />
          <WindowButton
            label={win.maximized ? 'Restaurar' : 'Maximizar'}
            icon={win.maximized ? Copy : Square}
            focused={focused}
            onClick={onToggleMaximize}
          />
          <WindowButton label="Minimizar" icon={Minus} focused={focused} onClick={onMinimize} />
        </div>

        <div className="pointer-events-none absolute inset-x-28 flex items-center justify-center gap-2 text-xs">
          <Icon
            className={cn('size-3.5 shrink-0', focused ? 'text-pcnGreen' : 'text-pcnGreen-500')}
            strokeWidth={2}
          />
          <span
            className={cn('truncate', focused ? 'text-pcnGreen text-glow' : 'text-pcnGreen-500')}
          >
            ~/{program.name.toLowerCase()}
            {subtitle && <span className="text-pcnGreen-500"> — {subtitle}</span>}
          </span>
        </div>

        <div className="ml-auto flex items-center gap-0.5">
          <button
            type="button"
            title="Recargar"
            aria-label="Recargar"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => iframeRef.current?.contentWindow?.location.reload()}
            className="flex size-6 items-center justify-center rounded-sm text-pcnGreen-500 transition-colors hover:bg-pcnGreen-200 hover:text-pcnGreen"
          >
            <RotateCw className="size-3" />
          </button>
          <a
            href={win.path}
            target="_blank"
            rel="noopener noreferrer"
            title="Abrir en una pestaña nueva"
            aria-label="Abrir en una pestaña nueva"
            onPointerDown={(e) => e.stopPropagation()}
            className="flex size-6 items-center justify-center rounded-sm text-pcnGreen-500 transition-colors hover:bg-pcnGreen-200 hover:text-pcnGreen"
          >
            <ExternalLink className="size-3" />
          </a>
        </div>
      </header>

      <div className="relative min-h-0 flex-1 bg-background">
        {suspended ? (
          <div className="flex size-full flex-col items-center justify-center gap-2 bg-background font-mono text-xs text-pcnGreen-600">
            <span className="text-pcnGreen">[ en pausa ]</span>
            <span>ventana dormida para ahorrar recursos · hacé clic para reanudar</span>
          </div>
        ) : (
          <iframe
            ref={(iframe) => {
              iframeRef.current = iframe;
              registerIframe(iframe);
            }}
            src={src}
            title={program.name}
            onLoad={() => {
              setLoaded(true);
              onIframeLoad();
            }}
            className="size-full border-0 bg-background"
          />
        )}
        {!loaded && !suspended && (
          <div className="absolute inset-0 flex items-center justify-center bg-background">
            <PcnLoader label={program.name.toLowerCase()} />
          </div>
        )}
      </div>

      {!win.maximized &&
        resizeHandles.map(({ direction, className }) => (
          <div
            key={direction}
            aria-hidden
            onPointerDown={(e) => startResize(e, direction)}
            className={cn('absolute z-10 touch-none', className)}
          />
        ))}
    </motion.section>
  );
}
