'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { PageTitle } from '@/components/ui/page-title';
import { StickyHeader } from '@/components/ui/sticky-header';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { TabBrackets, tabsListClassName, tabsTriggerClassName } from '@/components/ui/tab-styles';
import type { FeedItem, FeedKind } from '@/lib/feed';
import { cn } from '@/lib/utils';

const KINDS: Record<FeedKind, { label: string; tag: string; className: string }> = {
  evento: { label: 'eventos', tag: 'evento', className: 'border-rose-400/50 text-rose-300' },
  charla: { label: 'charlas', tag: 'charla', className: 'border-fuchsia-400/50 text-fuchsia-300' },
  fotos: { label: 'fotos', tag: 'galería', className: 'border-lime-400/50 text-lime-300' },
  setup: { label: 'setups', tag: 'setup', className: 'border-amber-400/50 text-amber-300' },
  proyecto: { label: 'proyectos', tag: 'proyecto', className: 'border-pink-400/50 text-pink-300' },
  conversacion: {
    label: 'grupo',
    tag: 'whatsapp',
    className: 'border-sky-400/50 text-sky-300',
  },
  changelog: {
    label: 'plataforma',
    tag: 'changelog',
    className: 'border-pcnGreen-200 text-pcnGreen-700',
  },
};

type Filter = 'todo' | FeedKind;

const shiftDay = (day: string, days: number) => {
  const date = new Date(`${day}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};

const dayLabel = (day: string, today: string) => {
  if (day === today) return 'hoy';
  if (day === shiftDay(today, -1)) return 'ayer';
  return new Date(`${day}T12:00:00`).toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
};

function FeedRow({ item }: { item: FeedItem }) {
  const kind = KINDS[item.kind];

  return (
    <Link href={item.href} className={cn(ruledCellClassName, 'group flex flex-col gap-1.5 p-3')}>
      <span className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
        <span className={cn('border px-1 leading-4', kind.className)}>{kind.tag}</span>
        {item.meta && <span className="min-w-0 truncate">{item.meta}</span>}
        <ArrowUpRight className="ml-auto size-3.5 shrink-0 text-muted-foreground/60 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-pcnGreen" />
      </span>

      <h3 className="font-mono text-sm font-semibold leading-snug tracking-tight text-foreground group-hover:text-pcnGreen">
        {item.title}
      </h3>

      {item.description && (
        <p className="line-clamp-3 text-xs leading-relaxed text-muted-foreground">
          {item.description}
        </p>
      )}

      {item.thumbs && item.thumbs.length > 0 && (
        <span className="mt-1 grid grid-cols-4 gap-1">
          {item.thumbs.map(({ id, src }) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={id}
              src={src}
              alt=""
              loading="lazy"
              decoding="async"
              className="aspect-square w-full rounded-sm bg-black object-cover brightness-[0.85] transition group-hover:brightness-100"
            />
          ))}
        </span>
      )}
    </Link>
  );
}

interface FeedClientProps {
  items: FeedItem[];
  /** The community's current day, computed on the server so "hoy" matches the feed's days. */
  today: string;
}

export function FeedClient({ items, today }: FeedClientProps) {
  const [filter, setFilter] = useState<Filter>('todo');

  // Only offer filters for kinds that actually have something to show.
  const filters = useMemo<Filter[]>(
    () => [
      'todo',
      ...(Object.keys(KINDS) as FeedKind[]).filter((kind) =>
        items.some((item) => item.kind === kind),
      ),
    ],
    [items],
  );

  const byDay = useMemo(() => {
    const groups = new Map<string, FeedItem[]>();
    for (const item of items)
      if (filter === 'todo' || item.kind === filter)
        groups.set(item.day, [...(groups.get(item.day) ?? []), item]);
    return [...groups.entries()];
  }, [items, filter]);

  return (
    <div className="flex flex-1 flex-col p-4 pt-0">
      <div className="mt-4">
        <StickyHeader>
          <PageTitle path="feed" meta="tail -f comunidad.log" />

          {/* Scrolls sideways instead of wrapping when the window is narrow. */}
          <div className="-mx-1 mb-3 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
            <div role="tablist" aria-label="Filtrar el feed" className={tabsListClassName}>
              {filters.map((value) => (
                <button
                  key={value}
                  type="button"
                  role="tab"
                  aria-selected={filter === value}
                  data-state={filter === value ? 'active' : 'inactive'}
                  onClick={() => setFilter(value)}
                  className={tabsTriggerClassName}
                >
                  <TabBrackets>{value === 'todo' ? 'todo' : KINDS[value].label}</TabBrackets>
                </button>
              ))}
            </div>
          </div>
        </StickyHeader>

        {byDay.length === 0 ? (
          <p className="mb-14 border border-dashed border-pcnGreen-200 py-10 text-center font-mono text-sm text-muted-foreground">
            <span className="text-pcnGreen-500">$ </span>nada nuevo por acá todavía
          </p>
        ) : (
          <div className="mb-14 space-y-6">
            {byDay.map(([day, dayItems]) => (
              <section key={day}>
                <h2 className="mb-2 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  <span className="text-pcnGreen">{'>'}</span>
                  <time dateTime={day} className="text-foreground">
                    {dayLabel(day, today)}
                  </time>
                  <span
                    aria-hidden
                    className="h-px flex-1 bg-gradient-to-r from-pcnGreen-400 to-transparent"
                  />
                  <span className="tabular-nums">[{dayItems.length}]</span>
                </h2>
                <RuledGrid className="grid-cols-1 xl:grid-cols-2">
                  {dayItems.map((item) => (
                    <FeedRow key={item.id} item={item} />
                  ))}
                </RuledGrid>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
