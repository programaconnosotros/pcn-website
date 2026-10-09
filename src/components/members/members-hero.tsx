'use client';

import { memo, useMemo } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { DirectoryMember } from './directory-members';
import { MemberGrowthChart } from './member-growth-chart';
import { MemberPhoto } from './member-photo';
import { communitySummary } from './member-stats';

type WallMember = Pick<DirectoryMember, 'id' | 'name' | 'image'> &
  Partial<Pick<DirectoryMember, 'optimizeImage'>>;
type HeroMember = WallMember &
  Pick<
    DirectoryMember,
    'isCofounder' | 'isAmbassador' | 'talks' | 'events' | 'projects' | 'createdAt'
  >;

export const memberInitials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

// A shade of the site green per person, so faces without a photo don't all look the same.
const fallbackShade = (id: string) => {
  let hash = 0;
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return ['bg-pcnGreen/10', 'bg-pcnGreen/20', 'bg-pcnGreen/30', 'bg-pcnGreen/5'][
    Math.abs(hash) % 4
  ];
};

function Readout({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-dashed border-pcnGreen-200/60 py-1 last:border-b-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          'tabular-nums',
          accent ? 'text-pcnGreen [text-shadow:0_0_8px_rgba(4,244,190,0.6)]' : 'text-foreground',
        )}
      >
        {value}
      </dd>
    </div>
  );
}

/**
 * Everyone's face in one wall, newest last: a grid of tiny nodes that light up on hover. Photos
 * load lazily as 32px thumbnails, and the links don't prefetch: hundreds of them are on screen
 * at once, and prefetching every profile would flood the network right as the page loads.
 */
export const MemberWall = memo(function MemberWall({ members }: { members: WallMember[] }) {
  return (
    <ul aria-label="Todos los miembros" className="flex flex-wrap gap-1">
      {members.map((member) => (
        <li key={member.id}>
          <Link
            href={`/perfil/${member.id}`}
            prefetch={false}
            title={member.name}
            aria-label={member.name}
            className={cn(
              'relative member-wall-node block size-7 overflow-hidden rounded-[3px] ring-1 ring-pcnGreen-200/70 sm:size-8',
              !member.image && fallbackShade(member.id),
            )}
          >
            {member.image ? (
              <MemberPhoto src={member.image} optimize={member.optimizeImage} size={40} />
            ) : (
              <span className="flex size-full items-center justify-center font-mono text-[9px] text-pcnGreen-700">
                {memberInitials(member.name)}
              </span>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
});

/**
 * The top of /miembros: a terminal status readout of the community (real counts), how it grew
 * month by month, and the wall with everyone's face.
 */
export const MembersHero = memo(function MembersHero({ members }: { members: HeroMember[] }) {
  const summary = useMemo(() => communitySummary(members), [members]);

  return (
    <section
      aria-label="La comunidad en números"
      className="members-hero relative mb-8 overflow-hidden border border-pcnGreen-200 font-mono"
    >
      <div className="flex items-center gap-2 border-b border-pcnGreen-200 bg-pcnGreen/[0.04] px-3 py-1.5 text-[11px] text-muted-foreground">
        <span className="size-2 rounded-full bg-pcnGreen shadow-[0_0_8px_rgba(4,244,190,1)]" />
        <span className="text-pcnGreen">pcn@comunidad</span>
        <span>:~$ ./status --miembros</span>
        <span className="ml-auto max-sm:hidden">desde {summary.since}</span>
      </div>

      <div className="grid gap-px bg-pcnGreen-200 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
        <div className="bg-background p-4">
          <p className="text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
            nodos conectados
          </p>
          <p className="mt-1 text-5xl font-semibold tracking-tight text-pcnGreen tabular-nums [text-shadow:0_0_24px_rgba(4,244,190,0.45)] sm:text-6xl">
            {summary.total}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {summary.joinedThisMonth > 0 ? (
              <>
                <span className="text-pcnGreen">+{summary.joinedThisMonth}</span> este mes
              </>
            ) : (
              'personas con cuenta en la plataforma'
            )}
          </p>

          <dl className="mt-4 text-xs">
            <Readout label="co-founders" value={summary.cofounders} />
            <Readout label="ambassadors" value={summary.ambassadors} accent />
            <Readout label="speakers" value={summary.speakers} />
            <Readout label="charlas dadas" value={summary.talks} accent />
            <Readout label="organizadores" value={summary.organizers} />
            <Readout label="builders" value={summary.builders} />
          </dl>
        </div>

        <div className="flex min-w-0 flex-col gap-4 bg-background p-4">
          <MemberGrowthChart points={summary.growth} />
          <div>
            <p className="mb-2 text-[11px] text-muted-foreground">
              <span className="text-pcnGreen-500">$ </span>ls ~/miembros{' '}
              <span className="text-muted-foreground/70"># pasá el mouse por una cara</span>
            </p>
            <MemberWall members={members} />
          </div>
        </div>
      </div>
    </section>
  );
});
