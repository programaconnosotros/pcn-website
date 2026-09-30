'use client';

import { LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AppIcon } from './app-icon';
import type { OsApp } from './apps';

const DockItem = ({
  app,
  running,
  onClick,
}: {
  app: Pick<OsApp, 'name' | 'icon'>;
  running: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    title={app.name}
    className="group relative flex w-[56px] shrink-0 flex-col items-center gap-1 rounded-md pt-1 outline-none focus-visible:ring-1 focus-visible:ring-pcnGreen xl:w-[70px]"
  >
    <AppIcon app={app} running={running} className="size-11" />
    <span className="w-full truncate text-center font-mono text-[10px] lowercase leading-tight text-pcnGreen-600 transition-colors group-hover:text-pcnGreen">
      {app.name}
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
  apps: OsApp[];
  runningApps: OsApp[];
  runningAppIds: Set<string>;
  onOpenApp: (app: OsApp) => void;
  onOpenLauncher: () => void;
}

/** Dock pinned to the bottom of the desktop. Every app shows its name under the icon. */
export function OsDock({
  apps,
  runningApps,
  runningAppIds,
  onOpenApp,
  onOpenLauncher,
}: OsDockProps) {
  const pinned = apps.filter((app) => app.pinned);
  const unpinnedRunning = runningApps.filter((app) => !app.pinned);

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
        {pinned.map((app) => (
          <DockItem
            key={app.id}
            app={app}
            running={runningAppIds.has(app.id)}
            onClick={() => onOpenApp(app)}
          />
        ))}
        {unpinnedRunning.length > 0 && <Divider />}
        {unpinnedRunning.map((app) => (
          <DockItem key={app.id} app={app} running onClick={() => onOpenApp(app)} />
        ))}
        <Divider />
        <DockItem
          app={{ name: 'Apps', icon: LayoutGrid }}
          running={false}
          onClick={onOpenLauncher}
        />
      </div>
    </nav>
  );
}
