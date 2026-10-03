'use client';

import { AdviseCard } from '@/components/advises/advise-card';
import { consejoHash, consejoHref } from '@/components/advises/consejo-utils';
import { useConsejosNav } from '@/components/advises/consejos-nav';
import { PageTitle } from '@/components/ui/page-title';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { StickyHeader } from '@/components/ui/sticky-header';
import type { Consejo } from '@/lib/consejos';
import type { SessionWithUser } from '@/lib/session';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useEffect, useMemo } from 'react';

function Stat({ label, value, lit }: { label: string; value: number; lit?: boolean }) {
  return (
    <div className={cn(ruledCellClassName, 'flex flex-col gap-0.5 px-3 py-2 font-mono')}>
      <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
      <span
        className={cn(
          'text-2xl font-semibold tabular-nums leading-none',
          lit ? 'text-pcnGreen [text-shadow:0_0_14px_rgba(4,244,190,0.6)]' : 'text-foreground',
        )}
      >
        {value}
      </span>
    </div>
  );
}

// `$ fortune`: one consejo picked for the day, as the page's hero.
function Fortune({ consejo }: { consejo: Consejo }) {
  return (
    <Link
      href={consejoHref(consejo.id)}
      scroll={false}
      className="group relative flex flex-col gap-2 overflow-hidden border border-pcnGreen-200 bg-black/40 p-4 font-mono transition-colors hover:border-pcnGreen-600"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(4,244,190,0.035)_0_1px,transparent_1px_3px)]"
      />
      <span className="relative flex items-center gap-2 text-[11px] text-muted-foreground">
        <span className="text-pcnGreen-600">$ fortune --consejos</span>
        <span className="ml-auto text-pcnGreen-600/70">#{consejoHash(consejo.id)}</span>
      </span>
      <span className="relative line-clamp-4 text-[15px] leading-relaxed text-foreground [text-shadow:0_0_18px_rgba(4,244,190,0.25)]">
        &ldquo;{consejo.content}&rdquo;
        <span
          aria-hidden
          className="ml-1 inline-block h-4 w-2 translate-y-0.5 animate-pulse bg-pcnGreen"
        />
      </span>
      <span className="relative text-[11px] text-muted-foreground">
        — <span className="text-pcnGreen">@{consejo.author.name}</span>
        {consejo.source && <span className="ml-2 text-pcnGreen-600">[auto]</span>}
      </span>
    </Link>
  );
}

interface ConsejosClientProps {
  consejos: Consejo[];
  session: SessionWithUser | null;
  /** Consejo of the day, picked on the server so both renders agree. */
  fortuneId: string | null;
  addButton: React.ReactNode;
}

export function ConsejosClient({ consejos, session, fortuneId, addButton }: ConsejosClientProps) {
  const { setIds } = useConsejosNav();

  const stats = useMemo(() => {
    const authors = new Set(consejos.map(({ author }) => author.id ?? author.name));
    return [
      { label: 'consejos', value: consejos.length },
      { label: 'autores', value: authors.size },
      {
        label: 'auto-extraídos',
        value: consejos.filter(({ source }) => source).length,
        lit: true,
      },
      {
        label: 'me gusta',
        value: consejos.reduce((sum, { likes }) => sum + (likes?.length ?? 0), 0),
      },
    ];
  }, [consejos]);

  const fortune = consejos.find(({ id }) => id === fortuneId);
  const visible = consejos;

  // The modal steps through exactly what the list shows.
  useEffect(() => {
    setIds(visible.map(({ id }) => id));
  }, [visible, setIds]);

  return (
    <div className="flex flex-1 flex-col p-4 pt-0">
      <div className="mt-4">
        <StickyHeader>
          <PageTitle
            path="consejos"
            meta={`${consejos.length} consejos de la comunidad`}
            action={addButton}
          />
        </StickyHeader>

        <div className="mb-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          <RuledGrid className="grid-cols-2 self-start sm:grid-cols-4 xl:grid-cols-2">
            {stats.map((stat) => (
              <Stat key={stat.label} {...stat} />
            ))}
          </RuledGrid>
          {fortune && <Fortune consejo={fortune} />}
        </div>

        {visible.length === 0 ? (
          <p className="mb-14 border border-dashed border-pcnGreen-200 py-10 text-center font-mono text-sm text-muted-foreground">
            <span className="text-pcnGreen-500">$ </span>No hay consejos para ver aún.
          </p>
        ) : (
          <RuledGrid className="mb-14 grid-cols-1 md:grid-cols-2 2xl:grid-cols-3">
            {visible.map((consejo) => (
              <AdviseCard key={consejo.id} consejo={consejo} session={session} />
            ))}
          </RuledGrid>
        )}
      </div>
    </div>
  );
}
