import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TimelineKind =
  | 'alta'
  | 'proyecto'
  | 'consejo'
  | 'charla'
  | 'articulo'
  | 'evento'
  | 'setup'
  | 'foro'
  | 'conversacion'
  | 'cambio'
  | 'logro';

export interface TimelineItem {
  id: string;
  kind: TimelineKind;
  /** YYYY-MM-DD, the community's day it happened on. */
  day: string;
  title: string;
  description?: string;
  /** Where to see it; a full URL opens outside the site. */
  href?: string;
}

// Same tag colors as /feed for the kinds both show.
const KINDS: Record<TimelineKind, { tag: string; className: string }> = {
  alta: { tag: 'alta', className: 'border-pcnGreen-400 text-pcnGreen' },
  proyecto: { tag: 'proyecto', className: 'border-pink-400/50 text-pink-300' },
  consejo: { tag: 'consejo', className: 'border-emerald-400/50 text-emerald-300' },
  charla: { tag: 'charla', className: 'border-fuchsia-400/50 text-fuchsia-300' },
  articulo: { tag: 'artículo', className: 'border-orange-400/50 text-orange-300' },
  evento: { tag: 'evento', className: 'border-rose-400/50 text-rose-300' },
  setup: { tag: 'setup', className: 'border-amber-400/50 text-amber-300' },
  foro: { tag: 'foro', className: 'border-cyan-400/50 text-cyan-300' },
  conversacion: { tag: 'whatsapp', className: 'border-sky-400/50 text-sky-300' },
  cambio: { tag: 'changelog', className: 'border-pcnGreen-200 text-pcnGreen-700' },
  logro: { tag: 'badge', className: 'border-yellow-400/50 text-yellow-300' },
};

const monthLabel = (day: string) =>
  new Date(`${day.slice(0, 7)}-15T12:00:00Z`).toLocaleDateString('es-AR', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });

const dayLabel = (day: string) =>
  new Date(`${day}T12:00:00Z`).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    timeZone: 'UTC',
  });

function TimelineEntry({ item }: { item: TimelineItem }) {
  const kind = KINDS[item.kind];
  const external = item.href?.startsWith('http');
  const body = (
    <>
      <span className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
        <time dateTime={item.day} className="tabular-nums">
          {dayLabel(item.day)}
        </time>
        <span className={cn('border px-1 leading-4', kind.className)}>{kind.tag}</span>
        {item.href && (
          <ArrowUpRight className="ml-auto size-3.5 shrink-0 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-pcnGreen" />
        )}
      </span>
      <span className="font-mono text-sm leading-snug font-semibold group-hover:text-pcnGreen">
        {item.title}
      </span>
      {item.description && (
        <span className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {item.description}
        </span>
      )}
    </>
  );
  const className = 'flex flex-col gap-1 py-2.5 pr-3 pl-5';

  return (
    <li className="relative">
      {/* The dot on the timeline's line. */}
      <span
        aria-hidden
        className="absolute top-[1.05rem] -left-[4.5px] size-2 rounded-full border border-pcnGreen-500 bg-background"
      />
      {item.href && external ? (
        <a
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(className, 'group hover:bg-pcnGreen/[0.04]')}
        >
          {body}
        </a>
      ) : item.href ? (
        <Link href={item.href} className={cn(className, 'group hover:bg-pcnGreen/[0.04]')}>
          {body}
        </Link>
      ) : (
        <div className={className}>{body}</div>
      )}
    </li>
  );
}

/** What the person did in the community, newest first, one section per month. */
export function ProfileTimeline({ items }: { items: TimelineItem[] }) {
  const months = new Map<string, TimelineItem[]>();
  for (const item of items) {
    const month = item.day.slice(0, 7);
    months.set(month, [...(months.get(month) ?? []), item]);
  }

  return (
    <div className="space-y-6">
      {[...months.entries()].map(([month, monthItems]) => (
        <section key={month} aria-label={monthLabel(month)}>
          <h2 className="mb-2 flex items-center gap-2 font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase">
            <span className="text-pcnGreen">{'>'}</span>
            <span className="text-foreground">{monthLabel(month)}</span>
            <span
              aria-hidden
              className="h-px flex-1 bg-linear-to-r from-pcnGreen-400 to-transparent"
            />
            <span className="tabular-nums">[{monthItems.length}]</span>
          </h2>
          <ol className="ml-1 border-l border-pcnGreen-200">
            {monthItems.map((item) => (
              <TimelineEntry key={item.id} item={item} />
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}
