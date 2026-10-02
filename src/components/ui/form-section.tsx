import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

// A form section: a `[01] name // description` header, with its progress when given, and the
// fields below. Stack them inside a `divide-y` bordered box so long forms read as chapters.
export const FormSection = ({
  id,
  index,
  title,
  description,
  done,
  total,
  optional,
  children,
}: {
  id: string;
  index: number;
  title: string;
  description?: string;
  /** Filled fields out of `total`; leave both out to hide the counter. */
  done?: number;
  total?: number;
  /** Optional sections show their count but don't add to the completion bar. */
  optional?: boolean;
  children: ReactNode;
}) => (
  <section id={id} className="scroll-mt-4">
    <header className="flex items-center justify-between gap-4 border-b border-pcnGreen-200 bg-pcnGreen/[0.03] px-4 py-2 font-mono">
      <h2 className="flex min-w-0 items-baseline gap-2 text-sm font-semibold">
        <span className="text-pcnGreen-500">[{String(index).padStart(2, '0')}]</span>
        {title}
        {description && (
          <span className="truncate text-[11px] font-normal text-muted-foreground max-sm:hidden">
            {'// '}
            {description}
          </span>
        )}
      </h2>
      {total !== undefined && (
        <span
          className={cn(
            'shrink-0 text-[11px] tabular-nums',
            done === total ? 'text-glow text-pcnGreen' : 'text-muted-foreground',
          )}
        >
          {optional && <span className="text-muted-foreground/60">opcional · </span>}
          {done}/{total}
        </span>
      )}
    </header>
    <div className="p-4">{children}</div>
  </section>
);
