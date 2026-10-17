'use client';

import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface MarkToggleProps {
  active: boolean;
  onToggle: () => void;
  icon: LucideIcon;
  /** Short lowercase label, e.g. `leído`. */
  label: string;
  /** Accessible description of what the toggle does, e.g. `Marcar como leído`. */
  title: string;
  className?: string;
}

// A small terminal-style toggle for personal marks (read, watched, saved). It sits above
// stretched links, so it stops the click from reaching them.
export function MarkToggle({
  active,
  onToggle,
  icon: Icon,
  label,
  title,
  className,
}: MarkToggleProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      title={title}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onToggle();
      }}
      className={cn(
        'relative z-10 inline-flex shrink-0 items-center gap-1 border px-1.5 py-0.5 font-mono text-[10px] tracking-wide lowercase transition-[color,background-color,border-color,box-shadow] duration-200 focus-visible:ring-1 focus-visible:ring-pcnGreen focus-visible:outline-hidden',
        active
          ? 'border-pcnGreen bg-pcnGreen/15 text-pcnGreen shadow-[0_0_10px_-2px_rgba(4,244,190,0.6)]'
          : 'border-pcnGreen-200 bg-black/40 text-muted-foreground hover:border-pcnGreen-500 hover:text-pcnGreen',
        className,
      )}
    >
      <Icon className={cn('size-3', active && 'fill-pcnGreen/30')} />
      {label}
    </button>
  );
}
