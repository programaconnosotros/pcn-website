'use client';

// Pieces shared by the errors and logs tables on /monitoreo.

import { type ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { TableCell } from '@/components/ui/table';
import { cn } from '@/lib/utils';

export type PaginationInfo = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export const formatDate = (date: Date) =>
  new Intl.DateTimeFormat('es-AR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date);

// `hace 3m` / `hace 2h` / `hace 4d`: short enough to fit a 36px row without wrapping.
export const formatRelativeTime = (date: Date) => {
  const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
  if (minutes < 1) return 'recién';
  if (minutes < 60) return `hace ${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours}h`;
  return `hace ${Math.floor(hours / 24)}d`;
};

// Metadata is stored as a JSON string; a malformed one shouldn't take the whole table down.
export const prettyJson = (value: string) => {
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
};

/** Relative time, with the full date on hover. */
export const TimeCell = ({ date }: { date: Date }) => (
  <TableCell className="whitespace-nowrap text-muted-foreground tabular-nums">
    {/* Relative time drifts between the server render and hydration; the minute bucket is fine. */}
    <time dateTime={date.toISOString()} title={formatDate(date)} suppressHydrationWarning>
      {formatRelativeTime(date)}
    </time>
  </TableCell>
);

/** Chevron that toggles a row's detail sub-row. */
export const ExpandButton = ({
  expanded,
  controls,
  label,
  onToggle,
}: {
  expanded: boolean;
  controls: string;
  label: string;
  onToggle: () => void;
}) => (
  <button
    type="button"
    aria-expanded={expanded}
    aria-controls={controls}
    onClick={(event) => {
      // The row itself also toggles on click; don't let it undo this one.
      event.stopPropagation();
      onToggle();
    }}
    className="rounded-sm p-0.5 text-muted-foreground transition-colors hover:text-pcnGreen focus-visible:ring-1 focus-visible:ring-pcnGreen focus-visible:outline-hidden"
  >
    <ChevronRight
      className={cn('size-3.5 transition-transform', expanded && 'rotate-90 text-pcnGreen')}
    />
    <span className="sr-only">
      {expanded ? 'Ocultar' : 'Ver'} detalles de {label}
    </span>
  </button>
);

/** A labeled `<pre>` block inside an expanded row. */
export const DetailBlock = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="min-w-0">
    <p className="mb-1 font-mono text-[10px] tracking-wider text-pcnGreen-600 uppercase">
      <span className="text-pcnGreen/60">{'// '}</span>
      {label}
    </p>
    <pre className="max-h-72 scrollbar-thin overflow-auto border border-pcnGreen/60 bg-black/50 p-2 font-mono text-[11px] leading-relaxed whitespace-pre text-foreground/80">
      {children}
    </pre>
  </div>
);

/** `--flag (n)` segmented control, like the filters on /vinculos. */
export function FlagGroup<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; count?: number }[];
  onChange: (_value: T) => void;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="flex max-w-full scrollbar-none overflow-x-auto border border-pcnGreen-200"
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            'h-7 shrink-0 border-r border-pcnGreen-200 px-2 font-mono text-[11px] transition-colors last:border-r-0',
            value === option.value
              ? 'bg-pcnGreen/15 text-pcnGreen'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          --{option.value}
          {option.count !== undefined && (
            <span className="ml-1 text-muted-foreground/70 tabular-nums">({option.count})</span>
          )}
        </button>
      ))}
    </div>
  );
}

/** `1–50 de 312   ‹ página 1/7 ›` */
export const Pager = ({
  pagination,
  noun,
  onPageChange,
}: {
  pagination: PaginationInfo;
  noun: string;
  onPageChange: (_page: number) => void;
}) => {
  const { page, limit, total, totalPages } = pagination;
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);
  const pages = Math.max(totalPages, 1);
  const arrowClassName =
    'grid size-6 place-items-center rounded-sm border border-pcnGreen-200 text-pcnGreen-600 transition-colors hover:border-pcnGreen-600 hover:text-pcnGreen disabled:pointer-events-none disabled:opacity-30';

  return (
    <nav
      aria-label={`Paginación de ${noun}`}
      className="flex flex-wrap items-center justify-between gap-2 border-t border-pcnGreen-200 px-3 py-1.5 font-mono text-[11px] text-muted-foreground"
    >
      <span className="tabular-nums">
        <span className="text-pcnGreen">
          {from}–{to}
        </span>{' '}
        de {total.toLocaleString()} {noun}
      </span>
      <span className="flex items-center gap-2 tabular-nums">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className={arrowClassName}
        >
          <span aria-hidden>‹</span>
          <span className="sr-only">Página anterior</span>
        </button>
        <span aria-live="polite">
          página <span className="text-pcnGreen">{page}</span>/{pages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pages}
          className={arrowClassName}
        >
          <span aria-hidden>›</span>
          <span className="sr-only">Página siguiente</span>
        </button>
      </span>
    </nav>
  );
};

/** `█████░░░░░░░` ratio bar for section headers. */
export const AsciiBar = ({
  value,
  total,
  width = 12,
}: {
  value: number;
  total: number;
  width?: number;
}) => {
  const filled = Math.round((value / Math.max(total, 1)) * width);
  return (
    <span aria-hidden className="tracking-tighter">
      <span className="text-pcnGreen">{'█'.repeat(filled)}</span>
      <span className="text-pcnGreen-200">{'░'.repeat(width - filled)}</span>
    </span>
  );
};

/** Title bar + `$ command` on the left, whatever summary on the right. */
export const SectionBar = ({
  title,
  command,
  children,
}: {
  title: string;
  command: string;
  children?: ReactNode;
}) => (
  <header className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-pcnGreen-200 bg-pcnGreen/[0.03] px-3 py-2 font-mono text-xs">
    <h2 className="font-semibold tracking-widest text-pcnGreen uppercase">{title}</h2>
    <span className="min-w-0 truncate text-muted-foreground">
      <span className="text-pcnGreen-600">$ </span>
      {command}
    </span>
    <span className="ml-auto flex items-center gap-2 text-muted-foreground tabular-nums">
      {children}
    </span>
  </header>
);

// ---------------------------------------------------------------------------------------------

// Row clicks toggle the details, except when the admin is just selecting text to copy it.
export const hasSelection = () => Boolean(window.getSelection()?.toString());
