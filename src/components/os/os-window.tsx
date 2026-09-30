'use client';

import { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Copy, ExternalLink, Minus, RotateCw, Square, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { OsProgram } from './programs';
import { PcnLoader } from '@/components/ui/pcn-loader';

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

const resizeCursors: Record<ResizeDirection, string> = {
  e: 'ew-resize',
  w: 'ew-resize',
  s: 'ns-resize',
  se: 'nwse-resize',
  sw: 'nesw-resize',
};

export type ClampMode = 'move' | 'resize';

export const MIN_WINDOW_WIDTH = 420;
export const MIN_WINDOW_HEIGHT = 280;

interface OsWindowProps {
  win: OsWindowState;
  program: OsProgram;
  /** Where the window is drawn. Differs from the stored rect when the window is maximized. */
  rect: Rect;
  zIndex: number;
  focused: boolean;
  /** Keeps the window inside the desktop: returns a rect clamped to it. */
  clampRect: (rect: Rect, mode: ClampMode) => Rect;
  onFocus: () => void;
  onClose: () => void;
  onMinimize: () => void;
  onToggleMaximize: () => void;
  onRectChange: (rect: Rect) => void;
  /** Called with the cursor to show while moving or resizing, and with null when done. */
  onInteractionChange: (cursor: string | null) => void;
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
      'group/btn flex size-[18px] items-center justify-center outline-none transition-[filter] duration-200',
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
const resizeHandles: { direction: ResizeDirection; className: string }[] = [
  { direction: 'e', className: 'right-0 top-10 bottom-3 w-1.5 cursor-ew-resize' },
  { direction: 'w', className: 'left-0 top-10 bottom-3 w-1.5 cursor-ew-resize' },
  { direction: 's', className: 'bottom-0 left-3 right-3 h-1.5 cursor-ns-resize' },
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
  onInteractionChange,
  registerIframe,
  onIframeLoad,
}: OsWindowProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [loaded, setLoaded] = useState(false);
  const Icon = program.icon;
  const pageTitle = cleanTitle(win.title);
  const subtitle = pageTitle && pageTitle !== program.name ? pageTitle : null;

  const startDrag = (event: React.PointerEvent) => {
    if (event.button !== 0) return;
    onFocus();
    // Dragging a maximized window restores it under the pointer, like a desktop OS does.
    const ratio = (event.clientX - rect.x) / rect.w;
    const start: Rect = win.maximized
      ? { ...win, x: Math.round(event.clientX - win.w * ratio), y: rect.y }
      : rect;
    onInteractionChange('default');
    trackPointer(
      event,
      (dx, dy) => onRectChange(clampRect({ ...start, x: start.x + dx, y: start.y + dy }, 'move')),
      () => onInteractionChange(null),
    );
  };

  const startResize = (event: React.PointerEvent, direction: ResizeDirection) => {
    if (event.button !== 0) return;
    event.stopPropagation();
    onFocus();
    const start = rect;
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
        onRectChange(clampRect(next, 'resize'));
      },
      () => onInteractionChange(null),
    );
  };

  return (
    <motion.section
      role="dialog"
      aria-label={program.name}
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
        'absolute flex flex-col overflow-hidden rounded-md border bg-background shadow-[0_30px_80px_-20px_rgba(0,0,0,0.85)]',
        focused
          ? 'border-pcnGreen-500 shadow-[0_0_40px_-12px_#04f4be80,0_30px_80px_-20px_rgba(0,0,0,0.85)]'
          : 'border-pcnGreen-200',
        win.maximized && 'rounded-none border-x-0',
        win.minimized && 'pointer-events-none',
      )}
    >
      <header
        onPointerDown={startDrag}
        onDoubleClick={onToggleMaximize}
        className={cn(
          'relative flex h-7 shrink-0 cursor-default touch-none select-none items-center border-b bg-black px-1.5 font-mono',
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
            className={cn('truncate', focused ? 'text-glow text-pcnGreen' : 'text-pcnGreen-500')}
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
        <iframe
          ref={(iframe) => {
            iframeRef.current = iframe;
            registerIframe(iframe);
          }}
          src={win.src}
          title={program.name}
          onLoad={() => {
            setLoaded(true);
            onIframeLoad();
          }}
          className="size-full border-0 bg-background"
        />
        {!loaded && (
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
