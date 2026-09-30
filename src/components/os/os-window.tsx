'use client';

import { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ExternalLink, RotateCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { OsApp } from './apps';

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface OsWindowState extends Rect {
  id: string;
  /** URL the iframe was created with. It never changes, so the iframe never reloads on re-render. */
  src: string;
  /** Current location inside the window, reported by the embedded page. */
  path: string;
  title: string | null;
  minimized: boolean;
  maximized: boolean;
}

type ResizeDirection = 'e' | 's' | 'w' | 'se' | 'sw';

export const MIN_WINDOW_WIDTH = 420;
export const MIN_WINDOW_HEIGHT = 280;

interface OsWindowProps {
  win: OsWindowState;
  app: OsApp;
  /** Where the window is drawn. Differs from the stored rect when the window is maximized. */
  rect: Rect;
  zIndex: number;
  focused: boolean;
  /** Keeps the title bar reachable: returns a rect clamped to the desktop. */
  clampRect: (rect: Rect) => Rect;
  onFocus: () => void;
  onClose: () => void;
  onMinimize: () => void;
  onToggleMaximize: () => void;
  onRectChange: (rect: Rect) => void;
  onInteractionChange: (interacting: boolean) => void;
  registerIframe: (iframe: HTMLIFrameElement | null) => void;
  onIframeLoad: () => void;
}

/** Strips the site-wide title template so the title bar shows only the page name. */
const cleanTitle = (title: string | null) =>
  title?.replace(/\s+-\s+PCN$/, '').replace(/^programaConNosotros$/, '') || null;

/** Follows the pointer until it is released, reporting the delta from where it started. */
const trackPointer = (
  event: React.PointerEvent,
  onMove: (dx: number, dy: number) => void,
  onEnd: () => void,
) => {
  const startX = event.clientX;
  const startY = event.clientY;
  const move = (e: PointerEvent) => onMove(e.clientX - startX, e.clientY - startY);
  const up = () => {
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', up);
    window.removeEventListener('pointercancel', up);
    onEnd();
  };
  window.addEventListener('pointermove', move);
  window.addEventListener('pointerup', up);
  window.addEventListener('pointercancel', up);
};

const TrafficLight = ({
  label,
  className,
  glyph,
  onClick,
}: {
  label: string;
  className: string;
  glyph: string;
  onClick: () => void;
}) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    onPointerDown={(e) => e.stopPropagation()}
    onClick={onClick}
    className={cn(
      "relative flex size-3 items-center justify-center rounded-full text-[9px] font-bold leading-none text-black/0 ring-1 ring-inset ring-black/20 transition-colors before:absolute before:-inset-1 before:content-[''] group-hover/lights:text-black/60",
      className,
    )}
  >
    {glyph}
  </button>
);

// Handles sit just inside the frame because the window clips its overflow for rounded corners.
const resizeHandles: { direction: ResizeDirection; className: string }[] = [
  { direction: 'e', className: 'right-0 top-10 bottom-3 w-1.5 cursor-ew-resize' },
  { direction: 'w', className: 'left-0 top-10 bottom-3 w-1.5 cursor-ew-resize' },
  { direction: 's', className: 'bottom-0 left-3 right-3 h-1.5 cursor-ns-resize' },
  { direction: 'se', className: 'bottom-0 right-0 size-3 cursor-nwse-resize' },
  { direction: 'sw', className: 'bottom-0 left-0 size-3 cursor-nesw-resize' },
];

export function OsWindow({
  win,
  app,
  rect,
  zIndex,
  focused,
  clampRect,
  onFocus,
  onClose,
  onMinimize,
  onToggleMaximize,
  onRectChange,
  onInteractionChange,
  registerIframe,
  onIframeLoad,
}: OsWindowProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [loaded, setLoaded] = useState(false);
  const Icon = app.icon;
  const pageTitle = cleanTitle(win.title);
  const subtitle = pageTitle && pageTitle !== app.name ? pageTitle : null;

  const startDrag = (event: React.PointerEvent) => {
    if (event.button !== 0) return;
    onFocus();
    // Dragging a maximized window restores it under the pointer, like a desktop OS does.
    const ratio = (event.clientX - rect.x) / rect.w;
    const start: Rect = win.maximized
      ? { ...win, x: Math.round(event.clientX - win.w * ratio), y: rect.y }
      : rect;
    onInteractionChange(true);
    trackPointer(
      event,
      (dx, dy) => onRectChange(clampRect({ ...start, x: start.x + dx, y: start.y + dy })),
      () => onInteractionChange(false),
    );
  };

  const startResize = (event: React.PointerEvent, direction: ResizeDirection) => {
    if (event.button !== 0) return;
    event.stopPropagation();
    onFocus();
    const start = rect;
    onInteractionChange(true);
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
        onRectChange(clampRect(next));
      },
      () => onInteractionChange(false),
    );
  };

  return (
    <motion.section
      role="dialog"
      aria-label={app.name}
      data-focused={focused}
      initial={{ opacity: 0, scale: 0.94, y: 16 }}
      animate={
        win.minimized
          ? { opacity: 0, scale: 0.4, y: 480, transition: { duration: 0.25, ease: 'easeIn' } }
          : { opacity: 1, scale: 1, y: 0, transition: { duration: 0.22, ease: 'easeOut' } }
      }
      exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.15 } }}
      onPointerDownCapture={onFocus}
      style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h, zIndex }}
      className={cn(
        'absolute flex flex-col overflow-hidden rounded-xl border bg-background shadow-[0_30px_80px_-20px_rgba(0,0,0,0.85)]',
        focused ? 'border-white/15' : 'border-white/[0.07]',
        win.maximized && 'rounded-none border-x-0',
        win.minimized && 'pointer-events-none',
      )}
    >
      <header
        onPointerDown={startDrag}
        onDoubleClick={onToggleMaximize}
        className={cn(
          'relative flex h-10 shrink-0 cursor-default touch-none select-none items-center border-b px-3',
          focused ? 'border-white/10 bg-zinc-900' : 'border-white/[0.06] bg-zinc-950',
        )}
      >
        <div className="group/lights flex items-center gap-2">
          <TrafficLight
            label="Cerrar"
            glyph="×"
            onClick={onClose}
            className={focused ? 'bg-[#ff5f57]' : 'bg-zinc-700'}
          />
          <TrafficLight
            label="Minimizar"
            glyph="−"
            onClick={onMinimize}
            className={focused ? 'bg-[#febc2e]' : 'bg-zinc-700'}
          />
          <TrafficLight
            label={win.maximized ? 'Restaurar' : 'Maximizar'}
            glyph="+"
            onClick={onToggleMaximize}
            className={focused ? 'bg-[#28c840]' : 'bg-zinc-700'}
          />
        </div>

        <div className="pointer-events-none absolute inset-x-28 flex items-center justify-center gap-2 text-[13px]">
          <span
            className={cn(
              'flex size-5 shrink-0 items-center justify-center rounded-md bg-gradient-to-br',
              app.color,
            )}
          >
            <Icon className="size-3 text-white" strokeWidth={2.4} />
          </span>
          <span
            className={cn('truncate font-semibold', focused ? 'text-white/90' : 'text-white/45')}
          >
            {app.name}
            {subtitle && <span className="font-normal text-white/40"> — {subtitle}</span>}
          </span>
        </div>

        <div className="ml-auto flex items-center gap-0.5">
          <button
            type="button"
            title="Recargar"
            aria-label="Recargar"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => iframeRef.current?.contentWindow?.location.reload()}
            className="flex size-7 items-center justify-center rounded-md text-white/40 transition-colors hover:bg-white/10 hover:text-white/80"
          >
            <RotateCw className="size-3.5" />
          </button>
          <a
            href={win.path}
            target="_blank"
            rel="noopener noreferrer"
            title="Abrir en una pestaña nueva"
            aria-label="Abrir en una pestaña nueva"
            onPointerDown={(e) => e.stopPropagation()}
            className="flex size-7 items-center justify-center rounded-md text-white/40 transition-colors hover:bg-white/10 hover:text-white/80"
          >
            <ExternalLink className="size-3.5" />
          </a>
        </div>
      </header>

      <div className="relative min-h-0 flex-1 bg-background">
        <iframe
          ref={(iframe) => {
            iframeRef.current = iframe;
            registerIframe(iframe);
          }}
          src={win.src}
          title={app.name}
          onLoad={() => {
            setLoaded(true);
            onIframeLoad();
          }}
          className="size-full border-0 bg-background"
        />
        {!loaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background">
            <span
              className={cn(
                'flex size-16 animate-pulse items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg',
                app.color,
              )}
            >
              <Icon className="size-8 text-white" />
            </span>
            <span className="text-xs text-white/40">Abriendo {app.name}…</span>
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
