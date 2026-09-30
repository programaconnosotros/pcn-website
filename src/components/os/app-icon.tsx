import { cn } from '@/lib/utils';
import type { OsApp } from './apps';

/**
 * Terminal-style tile: black glass, green phosphor glyph, corner brackets on hover.
 * Used in the dock and the launcher; hover effects follow the closest `group` parent.
 */
export function AppIcon({
  app,
  running = false,
  className,
}: {
  app: Pick<OsApp, 'icon'>;
  running?: boolean;
  className?: string;
}) {
  const Icon = app.icon;
  return (
    <span
      className={cn(
        'relative flex items-center justify-center rounded-md border bg-black/80 transition-all duration-200 ease-out',
        'group-hover:-translate-y-1 group-hover:border-pcnGreen group-hover:shadow-[0_0_18px_-2px_#04f4be99] group-active:scale-95',
        running ? 'border-pcnGreen-700 shadow-[0_0_10px_-4px_#04f4be]' : 'border-pcnGreen-300',
        className,
      )}
    >
      {/* Scanlines */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[repeating-linear-gradient(0deg,transparent_0,transparent_2px,rgba(4,244,190,0.06)_2px,rgba(4,244,190,0.06)_3px)]"
      />
      {/* Corner brackets */}
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-1 opacity-0 transition-opacity group-hover:opacity-100"
      >
        <span className="absolute left-0 top-0 size-2 border-l border-t border-pcnGreen" />
        <span className="absolute right-0 top-0 size-2 border-r border-t border-pcnGreen" />
        <span className="absolute bottom-0 left-0 size-2 border-b border-l border-pcnGreen" />
        <span className="absolute bottom-0 right-0 size-2 border-b border-r border-pcnGreen" />
      </span>
      <Icon
        className="relative size-1/2 text-pcnGreen-800 drop-shadow-[0_0_4px_#04f4be] transition-colors group-hover:text-pcnGreen"
        strokeWidth={1.75}
      />
    </span>
  );
}
