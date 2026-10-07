'use client';

import { cn } from '@/lib/utils';
import { ChevronDown, SlidersHorizontal } from 'lucide-react';
import { useId, useState, type ReactNode } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet';

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
  /**
   * On phones, open the filters in a bottom sheet instead of folding them open in the header, with
   * `extras` (stats, charts, long chip lists) that the page then hides on phones. Keeps the list
   * right under the search instead of a screen of controls away.
   */
  sheet?: {
    title: string;
    extras?: ReactNode;
    /** Shown on the sheet's close button, e.g. `ver 12 conversaciones`. */
    doneLabel?: string;
  };
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
  sheet,
}: CollapsibleFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const panelId = useId();
  const isMobile = useIsMobile();
  // The filters live in exactly one place: the sheet on phones, the header row otherwise.
  const inSheet = Boolean(sheet && isMobile);

  return (
    <div className={cn('flex flex-col gap-2 md:flex-row md:flex-wrap md:items-center', className)}>
      {leading && <div className="flex md:contents">{leading}</div>}
      <div className="flex items-center gap-2 md:contents">
        {search && <div className="min-w-0 flex-1 md:contents">{search}</div>}
        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          aria-expanded={isOpen}
          aria-controls={inSheet ? undefined : panelId}
          aria-haspopup={sheet ? 'dialog' : undefined}
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
          (!isOpen || sheet) && 'max-md:hidden',
          panelClassName,
        )}
      >
        {!inSheet && children}
      </div>
      {aside && (
        <div className={cn('md:ml-auto', (!isOpen || sheet) && 'max-md:hidden')}>{aside}</div>
      )}

      {sheet && (
        <Sheet open={inSheet && isOpen} onOpenChange={setIsOpen}>
          <SheetContent
            side="bottom"
            // Above the phone's tab bar, which would otherwise cover the sheet's bottom.
            className="z-70 flex max-h-[85dvh] flex-col gap-0 rounded-t-md border-pcnGreen-300 bg-black p-0 pb-[env(safe-area-inset-bottom)]"
          >
            <div className="flex shrink-0 items-center gap-2 border-b border-pcnGreen-200 px-4 py-3 pr-12">
              <SlidersHorizontal className="size-4 text-pcnGreen" />
              <SheetTitle className="font-mono text-sm">{sheet.title}</SheetTitle>
              {activeCount > 0 && (
                <span className="font-mono text-xs text-pcnGreen tabular-nums">
                  [{activeCount}]
                </span>
              )}
              <SheetDescription className="sr-only">
                Filtros y estadísticas de la lista
              </SheetDescription>
            </div>
            <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain px-4 py-4">
              {inSheet && (
                <div role="group" aria-label={label} className="flex flex-wrap items-center gap-2">
                  {children}
                </div>
              )}
              {aside && <div className="font-mono text-xs">{aside}</div>}
              {sheet.extras}
            </div>
            <div className="shrink-0 border-t border-pcnGreen-200 p-3">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="h-10 w-full rounded-sm bg-pcnGreen font-mono text-sm font-semibold text-black"
              >
                {sheet.doneLabel ?? 'ver resultados'}
              </button>
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
