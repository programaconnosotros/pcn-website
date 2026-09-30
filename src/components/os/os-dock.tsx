'use client';

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
    className="group relative flex w-[56px] shrink-0 flex-col items-center gap-1 rounded-md pt-1 outline-none focus-visible:ring-1 focus-visible:ring-pcnGreen xl:w-[70px]"
  >
    <ProgramIcon program={program} running={running} className="size-11" />
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

interface OsDockProps {
  programs: OsProgram[];
  runningPrograms: OsProgram[];
  runningProgramIds: Set<string>;
  onOpenProgram: (program: OsProgram) => void;
  onOpenLauncher: () => void;
}

/** Dock pinned to the bottom of the desktop. Every program shows its name under the icon. */
export function OsDock({
  programs,
  runningPrograms,
  runningProgramIds,
  onOpenProgram,
  onOpenLauncher,
}: OsDockProps) {
  const pinned = programs.filter((program) => program.pinned);
  const unpinnedRunning = runningPrograms.filter((program) => !program.pinned);

  return (
    <nav
      aria-label="Dock"
      className="fixed bottom-2 left-1/2 z-[5000] max-w-[calc(100vw-16px)] -translate-x-1/2"
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
