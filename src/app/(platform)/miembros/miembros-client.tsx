'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PageTitle } from '@/components/ui/page-title';
import { StickyHeader } from '@/components/ui/sticky-header';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { SearchBar } from '@/components/ui/search-bar';
import { CollapsibleFilters } from '@/components/ui/collapsible-filters';
import { matchesPeopleQuery } from '@/lib/people-search';
import type { CommunityMember } from '@/actions/users/fetch-community-members';
import { cn } from '@/lib/utils';

type Stat = 'talks' | 'events' | 'projects';

const STAT_LABELS: Record<Stat, [string, string]> = {
  talks: ['charla', 'charlas'],
  events: ['evento', 'eventos'],
  projects: ['proyecto', 'proyectos'],
};

const statLabel = (stat: Stat, count: number) =>
  `${count} ${STAT_LABELS[stat][count === 1 ? 0 : 1]}`;

const initials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

const byStat = (stat: Stat) => (a: CommunityMember, b: CommunityMember) =>
  b[stat] - a[stat] || a.name.localeCompare(b.name, 'es');

const byName = (a: CommunityMember, b: CommunityMember) => a.name.localeCompare(b.name, 'es');

interface Section {
  id: string;
  title: string;
  description: string;
  members: CommunityMember[];
  /** The count this list is about, highlighted on each row. */
  stat?: Stat;
  accent?: 'gold' | 'green';
}

// Cada puesto actual como "cargo @ empresa"; perfiles sin puestos guardados usan el cargo viejo.
function memberRoles(member: CommunityMember) {
  const positions =
    member.positions.length > 0
      ? member.positions
      : [{ jobTitle: member.jobTitle, enterprise: member.enterprise }];
  return positions
    .map((p) => [p.jobTitle, p.enterprise].filter(Boolean).join(' @ '))
    .filter(Boolean);
}

function MemberRow({
  member,
  stat,
  accent,
}: {
  member: CommunityMember;
  stat?: Stat;
  accent?: Section['accent'];
}) {
  const role = memberRoles(member).join(' · ');
  const stats = (['talks', 'events', 'projects'] as const).filter((s) => member[s] > 0);

  return (
    <Link
      href={`/perfil/${member.id}`}
      className={cn(ruledCellClassName, 'relative flex min-w-0 group gap-3 p-3')}
    >
      {accent && (
        <span
          aria-hidden
          className={cn(
            'pointer-events-none absolute inset-y-0 left-0 w-0.5',
            accent === 'gold' ? 'bg-amber-400' : 'bg-pcnGreen',
          )}
        />
      )}
      <Avatar className="size-9 shrink-0 rounded-sm ring-1 ring-pcnGreen-200 group-hover:ring-pcnGreen-600">
        <AvatarImage src={member.image ?? undefined} alt="" />
        <AvatarFallback className="rounded-sm text-[10px]">{initials(member.name)}</AvatarFallback>
      </Avatar>

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate font-mono text-sm font-medium transition-colors group-hover:text-pcnGreen">
          {member.name}
        </span>
        {role && <p className="truncate text-xs text-muted-foreground">{role}</p>}
        {member.slogan && (
          <p className="line-clamp-1 text-xs text-muted-foreground/80 italic">
            &quot;{member.slogan}&quot;
          </p>
        )}
        {stats.length > 0 && (
          <p className="flex flex-wrap gap-x-2 font-mono text-[11px] text-muted-foreground">
            {stats.map((s) => (
              <span key={s} className={cn(s === stat && 'text-pcnGreen')}>
                {statLabel(s, member[s])}
              </span>
            ))}
          </p>
        )}
      </div>

      {/* Role tags sit in the corner, so they line up on every card whatever the name's length. */}
      {(member.isCofounder || member.isAmbassador) && (
        <div className="flex shrink-0 flex-col items-end gap-1 self-start">
          {member.isCofounder && (
            <span className="border border-amber-400/60 px-1 font-mono text-[10px] leading-4 tracking-wider text-amber-400 uppercase">
              co-founder
            </span>
          )}
          {member.isAmbassador && (
            <span className="border border-pcnGreen-200 px-1 font-mono text-[10px] leading-4 tracking-wider text-pcnGreen-700 uppercase">
              ambassador
            </span>
          )}
        </div>
      )}
    </Link>
  );
}

export function MiembrosClient({ members }: { members: CommunityMember[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const query = searchTerm.trim();

  const filtered = useMemo(() => {
    if (!query) return members;
    return members.filter((member) =>
      matchesPeopleQuery(
        [member.name, member.slogan, member.career, member.studyPlace, ...memberRoles(member)],
        query,
      ),
    );
  }, [members, query]);

  const sections = useMemo<Section[]>(
    () =>
      [
        {
          id: 'co-founders',
          title: 'co-founders',
          description: 'Quienes arrancaron programaConNosotros.',
          members: filtered.filter((m) => m.isCofounder).sort(byName),
          accent: 'gold' as const,
        },
        {
          id: 'ambassadors',
          title: 'ambassadors',
          description: 'Organizan actividades, impulsan iniciativas y mueven la comunidad.',
          members: filtered.filter((m) => m.isAmbassador).sort(byName),
          accent: 'green' as const,
        },
        {
          id: 'speakers',
          title: 'speakers',
          description: 'Dieron charlas en eventos de la comunidad.',
          members: filtered.filter((m) => m.talks > 0).sort(byStat('talks')),
          stat: 'talks' as const,
        },
        {
          id: 'organizadores',
          title: 'organizadores',
          description: 'Organizaron eventos, meetups y coworks.',
          members: filtered.filter((m) => m.events > 0).sort(byStat('events')),
          stat: 'events' as const,
        },
        {
          id: 'builders',
          title: 'builders',
          description: 'Construyeron proyectos que compartieron con la comunidad.',
          members: filtered.filter((m) => m.projects > 0).sort(byStat('projects')),
          stat: 'projects' as const,
        },
        {
          id: 'todos',
          title: 'todos',
          description: 'Todas las personas con cuenta en la plataforma, las más nuevas primero.',
          members: [...filtered].reverse(),
        },
      ].filter((section) => section.members.length > 0),
    [filtered],
  );

  return (
    <div className="flex flex-1 flex-col p-4 pt-0">
      <div className="mt-4">
        <StickyHeader>
          <PageTitle path="miembros" meta="las personas que forman programaConNosotros" />

          <CollapsibleFilters
            className="mb-4"
            // Jump links, not filters: on phones they fold away like the filters of other pages.
            label="secciones"
            search={
              <SearchBar
                searchQuery={searchTerm}
                setSearchQuery={setSearchTerm}
                placeholder="nombre, cargo o empresa"
                label="Buscar miembros"
              />
            }
            aside={
              <p
                className="font-mono text-xs text-muted-foreground tabular-nums"
                aria-live="polite"
              >
                <span className={cn(query ? 'text-pcnGreen' : 'text-foreground')}>
                  {filtered.length}
                </span>
                /{members.length} miembros
              </p>
            }
          >
            <nav
              aria-label="Secciones"
              className="flex flex-wrap gap-x-3 font-mono text-xs text-muted-foreground"
            >
              {sections
                .filter(({ id }) => id !== 'todos')
                .map(({ id, title }) => (
                  <a key={id} href={`#${id}`} className="hover:text-pcnGreen">
                    #{title}
                  </a>
                ))}
            </nav>
          </CollapsibleFilters>
        </StickyHeader>

        {sections.length === 0 ? (
          <p className="mb-14 border border-dashed border-pcnGreen-200 py-10 text-center font-mono text-sm text-muted-foreground">
            <span className="text-pcnGreen-500">$ </span>0 resultados
            {query && (
              <>
                {' '}
                para <span className="text-pcnGreen">&quot;{searchTerm}&quot;</span>
              </>
            )}
          </p>
        ) : (
          <div className="mb-14 space-y-6">
            {sections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-24">
                <h2 className="flex items-center gap-2 font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase">
                  <span className="text-pcnGreen">{'>'}</span>
                  <span className="text-foreground">{section.title}</span>
                  <span
                    aria-hidden
                    className="h-px flex-1 bg-linear-to-r from-pcnGreen-400 to-transparent"
                  />
                  <span className="tabular-nums">[{section.members.length}]</span>
                </h2>
                <p className="mt-1 mb-2 text-xs text-muted-foreground">{section.description}</p>
                <RuledGrid className="grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
                  {section.members.map((member) => (
                    <MemberRow
                      key={member.id}
                      member={member}
                      stat={section.stat}
                      accent={section.accent}
                    />
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
