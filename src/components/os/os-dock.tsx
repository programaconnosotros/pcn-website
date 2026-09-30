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
  app: Pick<OsApp, 'name' | 'icon' | 'color'>;
  running: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    title={app.name}
    className="group relative flex w-[56px] shrink-0 flex-col items-center gap-1 rounded-lg pt-0.5 outline-none focus-visible:ring-2 focus-visible:ring-pcnGreen/60 xl:w-[70px]"
  >
    <AppIcon
      app={app}
      className="size-11 transition-transform duration-200 ease-out group-hover:-translate-y-1.5 group-hover:scale-110 group-active:scale-95"
    />
    <span className="w-full truncate text-center text-[10px] font-medium leading-tight text-white/70 transition-colors group-hover:text-white">
      {app.name}
    </span>
    <span
      aria-hidden
      className={cn(
        'size-1 rounded-full bg-white/80 transition-opacity',
        running ? 'opacity-100' : 'opacity-0',
      )}
    />
  </button>
);

const Divider = () => <span aria-hidden className="mx-1 mb-5 h-10 w-px self-end bg-white/15" />;

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
      <div className="flex items-end gap-0.5 overflow-x-auto rounded-[22px] border border-white/10 bg-zinc-900/60 px-2 pb-1 pt-2 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.8)] backdrop-blur-2xl [scrollbar-width:none]">
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
          app={{ name: 'Apps', icon: LayoutGrid, color: 'from-zinc-500 to-zinc-800' }}
          running={false}
          onClick={onOpenLauncher}
        />
      </div>
    </nav>
  );
}
