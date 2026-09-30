'use client';

import { useSyncExternalStore, type CSSProperties } from 'react';
import { LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProgramIcon } from './program-icon';
import type { OsProgram } from './programs';

const DockItem = ({
  program,
  running,
  onClick,
}: {
  program: Pick<OsProgram, 'name' | 'icon'>;
  running: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    title={program.name}
    className="group relative flex w-[var(--dock-item)] shrink-0 flex-col items-center gap-1 rounded-md pt-1 outline-none focus-visible:ring-1 focus-visible:ring-pcnGreen"
  >
    <ProgramIcon
      program={program}
      running={running}
      className="size-[min(44px,calc(var(--dock-item)-12px))]"
    />
    <span className="w-full truncate text-center font-mono text-[10px] lowercase leading-tight text-pcnGreen-600 transition-colors group-hover:text-pcnGreen">
      {program.name}
    </span>
    <span
      aria-hidden
      className={cn(
        'h-[3px] w-3 bg-pcnGreen shadow-[0_0_6px_#04f4be] transition-opacity',
        running ? 'animate-pulse opacity-100' : 'opacity-0',
      )}
    />
  </button>
);

const Divider = () => (
  <span aria-hidden className="mx-1 mb-6 self-end font-mono text-sm text-pcnGreen-400">
    |
  </span>
);

/** Widest a dock item gets; items shrink below this so the whole dock fits the screen. */
const MAX_ITEM_WIDTH = 70;
const MIN_ITEM_WIDTH = 40;
/** Screen margin, dock padding and border around the items. */
const DOCK_CHROME_WIDTH = 16 + 16 + 2;
const DIVIDER_WIDTH = 16;
const ITEM_GAP = 2;

const subscribeToResize = (onChange: () => void) => {
  window.addEventListener('resize', onChange);
  return () => window.removeEventListener('resize', onChange);
};

const useViewportWidth = () =>
  useSyncExternalStore(
    subscribeToResize,
    () => window.innerWidth,
    () => 0,
  );

/** Width for each dock item so every item fits on screen, however many programs are open. */
const dockItemWidth = (viewportWidth: number, items: number, dividers: number) => {
  if (!viewportWidth) return MAX_ITEM_WIDTH;
  const available =
    viewportWidth - DOCK_CHROME_WIDTH - dividers * DIVIDER_WIDTH - (items + dividers) * ITEM_GAP;
  return Math.max(MIN_ITEM_WIDTH, Math.min(MAX_ITEM_WIDTH, Math.floor(available / items)));
};

interface OsDockProps {
  programs: OsProgram[];
  runningPrograms: OsProgram[];
  runningProgramIds: Set<string>;
  onOpenProgram: (program: OsProgram) => void;
  onOpenLauncher: () => void;
}

/**
 * Dock pinned to the bottom of the desktop. Every program shows its name under the icon, and
 * items shrink as programs open so the dock always fits the screen without scrolling.
 */
export function OsDock({
  programs,
  runningPrograms,
  runningProgramIds,
  onOpenProgram,
  onOpenLauncher,
}: OsDockProps) {
  const pinned = programs.filter((program) => program.pinned);
  const unpinnedRunning = runningPrograms.filter((program) => !program.pinned);
  const viewportWidth = useViewportWidth();
  const itemWidth = dockItemWidth(
    viewportWidth,
    pinned.length + unpinnedRunning.length + 1,
    unpinnedRunning.length > 0 ? 2 : 1,
  );

  return (
    <nav
      aria-label="Dock"
      className="fixed bottom-2 left-1/2 z-[5000] max-w-[calc(100vw-16px)] -translate-x-1/2"
      style={{ '--dock-item': `${itemWidth}px` } as CSSProperties}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute left-3 top-0 z-10 -translate-y-1/2 bg-black px-1 font-mono text-[9px] tracking-widest text-pcnGreen-600"
      >
        ~/pcn $
      </span>
      <div className="flex items-end gap-0.5 overflow-x-auto rounded-md border border-pcnGreen-300 bg-black/85 px-2 pb-1 pt-2 shadow-[0_0_30px_-8px_#04f4be66,0_20px_60px_-10px_rgba(0,0,0,0.9)] backdrop-blur-xl [scrollbar-width:none]">
        {pinned.map((program) => (
          <DockItem
            key={program.id}
            program={program}
            running={runningProgramIds.has(program.id)}
            onClick={() => onOpenProgram(program)}
          />
        ))}
        {unpinnedRunning.length > 0 && <Divider />}
        {unpinnedRunning.map((program) => (
          <DockItem
            key={program.id}
            program={program}
            running
            onClick={() => onOpenProgram(program)}
          />
        ))}
        <Divider />
        <DockItem
          program={{ name: 'Programas', icon: LayoutGrid }}
          running={false}
          onClick={onOpenLauncher}
        />
      </div>
    </nav>
  );
}
