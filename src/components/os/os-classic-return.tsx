'use client';

import { MonitorDot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { isLowEndHardware, setDisplayMode, useDisplayMode } from './os-display-mode';

/**
 * In the classic layout on a large screen, the way back to PCN OS: liviano on computers with
 * few resources, the full desktop otherwise. Hidden everywhere else.
 */
export function OsClassicReturn({ className }: { className?: string }) {
  if (useDisplayMode() !== 'classic') return null;

  return (
    <button
      type="button"
      onClick={() => setDisplayMode(isLowEndHardware() ? 'lite' : 'full')}
      className={cn(
        'hidden h-8 w-full items-center justify-center gap-1.5 rounded-sm border border-pcnGreen-300 font-mono text-[11px] font-medium text-pcnGreen transition-colors hover:bg-pcnGreen/[0.08] lg:flex',
        className,
      )}
    >
      <MonitorDot className="size-3.5" strokeWidth={1.75} />
      Volver a PCN OS
    </button>
  );
}
