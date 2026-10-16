import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { RefreshCw } from 'lucide-react';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: ReactNode;
  description?: ReactNode;
  /** The command the panel "ran", e.g. `ls ~/lugares` or `grep -i "café"`. */
  command?: string;
  /** What the command printed before the message, e.g. `total 0`. */
  output?: string;
  /** Links or buttons under the message. */
  action?: ReactNode;
  showRefresh?: boolean;
  onRefresh?: () => void;
  className?: string;
}

/**
 * The page-level empty state: a terminal window that ran a command and got nothing back, with a
 * glowing NULL, the message as a shell comment and a blinking prompt waiting for the next move.
 * For empty sections inside a page (a profile tab, a dialog) use the one-line EmptyLine.
 */
export function EmptyState({
  title,
  description,
  command = 'ls',
  output = 'total 0',
  action,
  showRefresh = false,
  onRefresh,
  className,
}: EmptyStateProps) {
  return (
    <section
      role="status"
      className={cn(
        'relative isolate mx-auto mb-14 w-full max-w-2xl overflow-hidden rounded-sm border border-pcnGreen-300 bg-black/60 font-mono text-xs shadow-[0_0_48px_-18px_rgba(4,244,190,0.55)]',
        // Scanlines over the whole window.
        'after:pointer-events-none after:absolute after:inset-0 after:-z-10 after:bg-[repeating-linear-gradient(0deg,rgba(4,244,190,0.045)_0_1px,transparent_1px_3px)]',
        className,
      )}
    >
      <header className="flex items-center gap-2 border-b border-pcnGreen-200 bg-pcnGreen-50 px-3 py-1.5 text-[10px] text-pcnGreen-600">
        <span aria-hidden className="flex gap-1">
          <span className="size-2 rounded-full bg-pcnGreen-300" />
          <span className="size-2 rounded-full bg-pcnGreen-200" />
          <span className="size-2 rounded-full bg-pcnGreen-100" />
        </span>
        <span className="truncate">pcn@sin-fronteras: ~</span>
        <span className="ml-auto shrink-0 text-pcnGreen-500">exit 0</span>
      </header>

      <div className="space-y-1 p-4 sm:p-6">
        <p className="break-all">
          <span aria-hidden className="text-pcnGreen-600 select-none">
            ${' '}
          </span>
          <span className="text-pcnGreen">{command}</span>
        </p>
        <p className="text-muted-foreground">{output}</p>

        <p aria-hidden className="my-5 flex items-end gap-3 select-none">
          <span className="text-5xl leading-none font-black tracking-tighter text-pcnGreen [text-shadow:3px_0_rgba(80,56,189,0.95),-2px_0_rgba(4,244,190,0.3),0_0_28px_rgba(4,244,190,0.5)] sm:text-6xl">
            NULL
          </span>
          <span className="pb-1 text-[10px] leading-tight text-pcnGreen-500">
            0x00
            <br />0 bytes
          </span>
        </p>

        <h3 className="text-sm font-semibold text-foreground before:mr-[1ch] before:text-pcnGreen-500 before:content-['#']">
          {title}
        </h3>
        {description && (
          <p className="max-w-prose pl-[2ch] leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}

        {(action || showRefresh) && (
          <div className="flex flex-wrap items-center gap-3 pt-4">
            {action}
            {showRefresh && (
              <Button variant="outline" size="sm" onClick={onRefresh}>
                <RefreshCw className="size-3.5" />
                limpiarFiltros();
              </Button>
            )}
          </div>
        )}

        <p aria-hidden className="pt-3 text-pcnGreen-600 select-none">
          ${' '}
          <span className="inline-block h-[1.1em] w-[0.6em] translate-y-[0.15em] animate-blink bg-pcnGreen motion-reduce:animate-none" />
        </p>
      </div>
    </section>
  );
}
