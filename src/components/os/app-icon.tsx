import { cn } from '@/lib/utils';
import type { OsApp } from './apps';

/** Rounded gradient tile with the app's glyph, used in the dock and the launcher. */
export function AppIcon({
  app,
  className,
}: {
  app: Pick<OsApp, 'icon' | 'color'>;
  className?: string;
}) {
  const Icon = app.icon;
  return (
    <span
      className={cn(
        'relative flex items-center justify-center rounded-[27%] bg-gradient-to-br shadow-[0_6px_16px_-6px_rgba(0,0,0,0.7)] ring-1 ring-inset ring-white/20',
        app.color,
        className,
      )}
    >
      <span className="absolute inset-x-0 top-0 h-1/2 rounded-t-[inherit] bg-gradient-to-b from-white/25 to-transparent" />
      <Icon className="relative size-1/2 text-white drop-shadow-sm" strokeWidth={2} />
    </span>
  );
}
