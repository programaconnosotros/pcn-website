'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { PageTitle } from '@/components/ui/page-title';
import { StickyHeader } from '@/components/ui/sticky-header';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { SearchBar } from '@/components/ui/search-bar';
import { normalize } from '@/components/conversations/highlight';
import type { ChangelogAuthor, VisibleChangelogEntry } from '@/lib/changelog';
import { cn } from '@/lib/utils';

const dayLabel = (date: string) =>
  new Date(`${date}T12:00:00`).toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

// `@Name` links to the PCN profile the GitHub login is linked to; unlinked logins show as plain
// text since there is no profile to open.
function Author({ author }: { author: ChangelogAuthor }) {
  if (!author.user) {
    return (
      <span className="text-muted-foreground" title="Sin perfil vinculado en PCN">
        <span className="text-pcnGreen-600">@</span>
        {author.login}
      </span>
    );
  }

  return (
    <Link
      href={`/perfil/${author.user.id}`}
      title={`Ver el perfil de ${author.user.name}`}
      className="text-pcnGreen-700 transition-colors hover:text-pcnGreen"
    >
      <span className="text-pcnGreen-600">@</span>
      {author.user.name}
    </Link>
  );
}

function ChangelogRow({ entry }: { entry: VisibleChangelogEntry }) {
  return (
    <article
      className={cn(
        ruledCellClassName,
        'relative flex flex-col gap-1.5 p-3',
        entry.adminOnly && 'bg-amber-400/[0.03] hover:bg-amber-400/[0.06]',
      )}
    >
      {entry.adminOnly && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-0.5 bg-amber-400"
        />
      )}

      <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-muted-foreground">
        <span className="border border-pcnGreen-200 px-1 leading-4 text-pcnGreen-700">
          {entry.area}
        </span>
        {entry.adminOnly && (
          <span className="border border-amber-400/60 px-1 text-[10px] uppercase leading-4 tracking-wider text-amber-400">
            solo admins
          </span>
        )}
        <span className="ml-auto flex flex-wrap items-center gap-x-2">
          {entry.authors.map((author) => (
            <Author key={author.login} author={author} />
          ))}
        </span>
      </div>

      <h3 className="font-semibold leading-snug">
        {entry.href ? (
          <Link
            href={entry.href}
            className="group inline-flex items-center gap-1 transition-colors hover:text-pcnGreen"
          >
            {entry.title}
            <ArrowUpRight className="size-3.5 text-pcnGreen-600 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        ) : (
          entry.title
        )}
      </h3>
      <p className="text-sm text-muted-foreground">{entry.description}</p>
    </article>
  );
}

interface ChangelogClientProps {
  entries: VisibleChangelogEntry[];
  isAdmin: boolean;
}

export function ChangelogClient({ entries, isAdmin }: ChangelogClientProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = useMemo(() => {
    const query = normalize(searchTerm.trim());
    if (!query) return entries;
    return entries.filter((entry) =>
      [
        entry.title,
        entry.description,
        entry.area,
        ...entry.authors.flatMap(({ login, user }) => [login, user?.name ?? '']),
      ].some((text) => normalize(text).includes(query)),
    );
  }, [entries, searchTerm]);

  const byDay = useMemo(() => {
    const groups = new Map<string, VisibleChangelogEntry[]>();
    for (const entry of filtered)
      groups.set(entry.date, [...(groups.get(entry.date) ?? []), entry]);
    return [...groups.entries()];
  }, [filtered]);

  return (
    <div className="flex flex-1 flex-col p-4 pt-0">
      <div className="mt-4">
        <StickyHeader>
          <PageTitle
            path="changelog"
            meta="los últimos cambios de la plataforma"
            action={
              isAdmin && (
                <Link
                  href="/vinculos"
                  className="font-mono text-xs text-pcnGreen-700 hover:text-pcnGreen"
                >
                  vincular perfiles →
                </Link>
              )
            }
          />

          <div className="mb-4 flex flex-wrap items-center gap-2">
            <SearchBar
              searchQuery={searchTerm}
              setSearchQuery={setSearchTerm}
              placeholder="cambios, secciones o personas"
              label="Buscar cambios"
            />
            <p
              className="ml-auto font-mono text-xs tabular-nums text-muted-foreground"
              aria-live="polite"
            >
              <span className={cn(searchTerm.trim() ? 'text-pcnGreen' : 'text-foreground')}>
                {filtered.length}
              </span>
              /{entries.length} cambios
            </p>
          </div>
        </StickyHeader>

        {filtered.length === 0 ? (
          <p className="mb-14 border border-dashed border-pcnGreen-200 py-10 text-center font-mono text-sm text-muted-foreground">
            <span className="text-pcnGreen-500">$ </span>0 resultados
            {searchTerm.trim() && (
              <>
                {' '}
                para <span className="text-pcnGreen">&quot;{searchTerm}&quot;</span>
              </>
            )}
          </p>
        ) : (
          <div className="mb-14 space-y-6">
            {byDay.map(([date, items]) => (
              <section key={date}>
                <h2 className="mb-2 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  <span className="text-pcnGreen">{'>'}</span>
                  <time dateTime={date} className="text-foreground">
                    {date}
                  </time>
                  <span className="max-sm:hidden">{dayLabel(date)}</span>
                  <span
                    aria-hidden
                    className="h-px flex-1 bg-gradient-to-r from-pcnGreen-400 to-transparent"
                  />
                  <span className="tabular-nums">[{items.length}]</span>
                </h2>
                <RuledGrid className="grid-cols-1 lg:grid-cols-2">
                  {items.map((entry) => (
                    <ChangelogRow key={`${entry.date}-${entry.title}`} entry={entry} />
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
