'use client';

import { memo, useDeferredValue, useMemo, useState } from 'react';
import Link from 'next/link';
import { PageTitle } from '@/components/ui/page-title';
import { StickyHeader } from '@/components/ui/sticky-header';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { SearchBar } from '@/components/ui/search-bar';
import { CollapsibleFilters } from '@/components/ui/collapsible-filters';
import { searchTokens } from '@/lib/people-search';
import { cn } from '@/lib/utils';
import { MembersHero, memberInitials } from '@/components/members/members-hero';
import { MemberPhoto } from '@/components/members/member-photo';
import { type DirectoryMember, memberSearchText } from '@/components/members/directory-members';

type Stat = 'talks' | 'events' | 'projects';

const STAT_LABELS: Record<Stat, [string, string]> = {
  talks: ['charla', 'charlas'],
  events: ['evento', 'eventos'],
  projects: ['proyecto', 'proyectos'],
};

const statLabel = (stat: Stat, count: number) =>
  `${count} ${STAT_LABELS[stat][count === 1 ? 0 : 1]}`;

// One collator for every sort: `localeCompare(b, 'es')` builds a new one on each comparison,
// thousands of times per keystroke with a few hundred members.
const collator = new Intl.Collator('es');

const byStat = (stat: Stat) => (a: DirectoryMember, b: DirectoryMember) =>
  b[stat] - a[stat] || collator.compare(a.name, b.name);

const byName = (a: DirectoryMember, b: DirectoryMember) => collator.compare(a.name, b.name);

interface Section {
  id: string;
  title: string;
  description: string;
  members: DirectoryMember[];
  /** The count this list is about, highlighted on each row. */
  stat?: Stat;
  accent?: 'gold' | 'green';
}

// Memoized: a search re-renders only the rows that change, not every row of every section.
const MemberRow = memo(function MemberRow({
  member,
  number,
  stat,
  rank,
  accent,
  hidden,
}: {
  member: DirectoryMember;
  /** Their place in the community, by when they joined: node #0042. */
  number: number;
  stat?: Stat;
  /** Top three of a ranked section (most talks, events, projects). */
  rank?: number;
  accent?: Section['accent'];
  /** Doesn't match the search: kept mounted, so clearing it doesn't rebuild the row. */
  hidden?: boolean;
}) {
  const { role } = member;
  const stats = (['talks', 'events', 'projects'] as const).filter((s) => member[s] > 0);

  return (
    <Link
      href={`/perfil/${member.id}`}
      hidden={hidden}
      // The browser skips layout and paint of the rows off screen (content-visibility), so
      // scrolling a directory of hundreds stays smooth.
      className={cn(
        ruledCellClassName,
        'member-node relative flex min-w-0 group gap-3 p-3 [contain-intrinsic-size:auto_5rem] [content-visibility:auto]',
      )}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute right-3 bottom-2 font-mono text-[9px] tracking-widest text-muted-foreground/40 tabular-nums transition-colors group-hover:text-pcnGreen/70"
      >
        #{String(number).padStart(4, '0')}
      </span>
      {accent && (
        <span
          aria-hidden
          className={cn(
            'pointer-events-none absolute inset-y-0 left-0 w-0.5',
            accent === 'gold' ? 'bg-amber-400' : 'bg-pcnGreen',
          )}
        />
      )}
      <div className="relative shrink-0">
        {/* Initials under the photo: they show while it loads, if it fails, or when there's none. */}
        <span className="member-avatar relative flex size-10 shrink-0 overflow-hidden rounded-sm ring-1 ring-pcnGreen-200 group-hover:ring-pcnGreen">
          <span className="flex size-full items-center justify-center rounded-sm bg-muted text-[10px]">
            {memberInitials(member.name)}
          </span>
          {member.image && (
            <MemberPhoto src={member.image} optimize={member.optimizeImage} size={40} />
          )}
        </span>
        {rank !== undefined && (
          <span
            className={cn(
              'absolute -top-1.5 -left-1.5 flex h-4 min-w-4 items-center justify-center px-0.5 font-mono text-[9px] font-semibold tabular-nums',
              rank === 1
                ? 'bg-pcnGreen text-black shadow-[0_0_10px_rgba(4,244,190,0.9)]'
                : 'border border-pcnGreen-200 bg-background text-pcnGreen',
            )}
          >
            {String(rank).padStart(2, '0')}
          </span>
        )}
      </div>

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
});

// Sorted once per member list, never per keystroke: a search only hides the rows that don't
// match (see MemberSection), so nothing is re-sorted, unmounted or mounted again while typing.
const buildSections = (members: DirectoryMember[]): Section[] =>
  [
    {
      id: 'co-founders',
      title: 'co-founders',
      description: 'Quienes arrancaron programaConNosotros.',
      members: members.filter((m) => m.isCofounder).sort(byName),
      accent: 'gold' as const,
    },
    {
      id: 'ambassadors',
      title: 'ambassadors',
      description: 'Organizan actividades, impulsan iniciativas y mueven la comunidad.',
      members: members.filter((m) => m.isAmbassador).sort(byName),
      accent: 'green' as const,
    },
    {
      id: 'speakers',
      title: 'speakers',
      description: 'Dieron charlas en eventos de la comunidad.',
      members: members.filter((m) => m.talks > 0).sort(byStat('talks')),
      stat: 'talks' as const,
    },
    {
      id: 'organizadores',
      title: 'organizadores',
      description: 'Organizaron eventos, meetups y coworks.',
      members: members.filter((m) => m.events > 0).sort(byStat('events')),
      stat: 'events' as const,
    },
    {
      id: 'builders',
      title: 'builders',
      description: 'Construyeron proyectos que compartieron con la comunidad.',
      members: members.filter((m) => m.projects > 0).sort(byStat('projects')),
      stat: 'projects' as const,
    },
    {
      id: 'todos',
      title: 'todos',
      description: 'Todas las personas con cuenta en la plataforma, las más nuevas primero.',
      members: [...members].reverse(),
    },
  ].filter((section) => section.members.length > 0);

type Matches = ReadonlySet<string> | null;

/** How many of a section's members match the search (`null`: no search, all of them). */
const visibleCount = (section: Section, matches: Matches) =>
  matches
    ? section.members.reduce((n, member) => n + (matches.has(member.id) ? 1 : 0), 0)
    : section.members.length;

const MemberSection = memo(function MemberSection({
  section,
  matches,
  numbers,
}: {
  section: Section;
  matches: Matches;
  numbers: ReadonlyMap<string, number>;
}) {
  const count = visibleCount(section, matches);
  // A podium only means something when more than three compete.
  const ranked = !!section.stat && count > 3;
  let place = 0;

  return (
    <section id={section.id} hidden={count === 0} className="scroll-mt-24">
      <h2 className="flex items-center gap-2 font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase">
        <span className="text-pcnGreen">{'>'}</span>
        <span className="text-foreground">{section.title}</span>
        <span aria-hidden className="h-px flex-1 bg-linear-to-r from-pcnGreen-400 to-transparent" />
        <span className="tabular-nums">[{count}]</span>
      </h2>
      <p className="mt-1 mb-2 font-mono text-xs text-muted-foreground">
        <span className="text-pcnGreen-500"># </span>
        {section.description}
      </p>
      <RuledGrid className="grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
        {section.members.map((member) => {
          const visible = !matches || matches.has(member.id);
          const index = visible ? place++ : -1;
          return (
            <MemberRow
              key={member.id}
              member={member}
              number={numbers.get(member.id) ?? 0}
              stat={section.stat}
              rank={ranked && visible && index < 3 ? index + 1 : undefined}
              accent={section.accent}
              hidden={!visible}
            />
          );
        })}
      </RuledGrid>
    </section>
  );
});

export function MiembrosClient({ members }: { members: DirectoryMember[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  // The input updates right away; the lists follow at lower priority, so typing never waits for
  // the rows to update.
  const query = useDeferredValue(searchTerm).trim();
  const searchTexts = useMemo(() => members.map(memberSearchText), [members]);
  // Members come oldest first: that order numbers the nodes.
  const numbers = useMemo(
    () => new Map(members.map((member, index) => [member.id, index + 1])),
    [members],
  );
  const sections = useMemo(() => buildSections(members), [members]);

  // Ids of the members matching the search, or null without one.
  const matches = useMemo<Matches>(() => {
    const tokens = searchTokens(query);
    if (tokens.length === 0) return null;
    return new Set(
      members
        .filter((_, index) => tokens.every((token) => searchTexts[index].includes(token)))
        .map((member) => member.id),
    );
  }, [members, searchTexts, query]);
  const found = matches ? matches.size : members.length;
  const shownSections = sections.filter((section) => visibleCount(section, matches) > 0);

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
                <span className={cn(query ? 'text-pcnGreen' : 'text-foreground')}>{found}</span>/
                {members.length} miembros
              </p>
            }
          >
            <nav
              aria-label="Secciones"
              className="flex flex-wrap gap-x-3 font-mono text-xs text-muted-foreground"
            >
              {shownSections
                .filter(({ id }) => id !== 'todos')
                .map(({ id, title }) => (
                  <a key={id} href={`#${id}`} className="hover:text-pcnGreen">
                    #{title}
                  </a>
                ))}
            </nav>
          </CollapsibleFilters>
        </StickyHeader>

        {/* Hidden, not unmounted, while searching: clearing the search doesn't rebuild the wall. */}
        {members.length > 0 && (
          <div hidden={!!query}>
            <MembersHero members={members} />
          </div>
        )}

        {shownSections.length === 0 && (
          <p className="mb-14 border border-dashed border-pcnGreen-200 py-10 text-center font-mono text-sm text-muted-foreground">
            <span className="text-pcnGreen-500">$ </span>0 resultados
            {query && (
              <>
                {' '}
                para <span className="text-pcnGreen">&quot;{searchTerm}&quot;</span>
              </>
            )}
          </p>
        )}
        {sections.length > 0 && (
          <div hidden={shownSections.length === 0} className="mb-14 space-y-6">
            {sections.map((section) => (
              <MemberSection
                key={section.id}
                section={section}
                matches={matches}
                numbers={numbers}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
