'use client';

import { cn } from '@/lib/utils';
import { ChevronDown, SlidersHorizontal } from 'lucide-react';
import { useId, useState, type ReactNode } from 'react';

interface CollapsibleFiltersProps {
  /** Always visible, before the search (e.g. tabs); gets its own row on phones. */
  leading?: ReactNode;
  /** Always visible: on phones it shares one row with the toggle. */
  search?: ReactNode;
  /** The filter controls, folded behind the toggle on phones and always shown from `md` up. */
  children: ReactNode;
  /** Filters currently narrowing the list, shown on the toggle as `filtros [2]`. */
  activeCount?: number;
  /** Toggle text, for the rare header whose extras aren't filters (`secciones`). */
  label?: string;
  /** Status text (`12/120 resultados`) pushed to the row's end; folded with the filters on phones. */
  aside?: ReactNode;
  className?: string;
  /** Extra classes for the filters row, e.g. `md:order-first md:basis-full` to keep it on top. */
  panelClassName?: string;
}

// Search plus filters for a page header. From `md` up it's a single wrapping row with every
// control; on phones only the search and a `filtros [n]` toggle stay, so a header revealed by
// scrolling up doesn't eat a third of the screen. Children render once (just hidden), so selects
// keep their state across the toggle and breakpoints.
export function CollapsibleFilters({
  leading,
  search,
  children,
  activeCount = 0,
  label = 'filtros',
  aside,
  className,
  panelClassName,
}: CollapsibleFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const panelId = useId();

  return (
    <div className={cn('flex flex-col gap-2 md:flex-row md:flex-wrap md:items-center', className)}>
      {leading && <div className="flex md:contents">{leading}</div>}
      <div className="flex items-center gap-2 md:contents">
        {search && <div className="min-w-0 flex-1 md:contents">{search}</div>}
        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          aria-expanded={isOpen}
          aria-controls={panelId}
          className={cn(
            'flex h-8 shrink-0 items-center gap-1.5 rounded-sm border px-2.5 font-mono text-xs transition-colors md:hidden',
            isOpen || activeCount > 0
              ? 'border-pcnGreen-600 text-pcnGreen'
              : 'border-pcnGreen-200 text-muted-foreground hover:border-pcnGreen-400 hover:text-foreground',
            !search && 'self-start',
          )}
        >
          <SlidersHorizontal className="size-3.5" />
          {label}
          {activeCount > 0 && <span className="tabular-nums">[{activeCount}]</span>}
          <ChevronDown className={cn('size-3.5 transition-transform', isOpen && 'rotate-180')} />
        </button>
      </div>
      <div
        id={panelId}
        role="group"
        aria-label={label}
        className={cn(
          'flex flex-wrap items-center gap-2',
          !isOpen && 'max-md:hidden',
          panelClassName,
        )}
      >
        {children}
      </div>
      {aside && <div className={cn('md:ml-auto', !isOpen && 'max-md:hidden')}>{aside}</div>}
    </div>
  );
}
