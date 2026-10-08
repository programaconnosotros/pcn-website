import Image from 'next/image';
import { groupPulls, pullSummary } from '@/lib/pull-kinds';
import Link from 'next/link';
import { ArrowUpRight, ChevronRight } from 'lucide-react';
import type { Conversation } from '@/data/whatsapp-conversations';
import { conversationHref } from '@/components/conversations/conversation-utils';
import type { ContributorStat } from '@/lib/github-stats';
import { RuledCell, RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { cn } from '@/lib/utils';
import { ProfileTabLink } from './profile-tab-nav';
import { VideoBadge } from '@/components/photo-gallery/video-badge';
import type { fetchEvents } from '@/actions/events/fetch-events';
import { EventExhibit } from '@/components/events/event-exhibit';
import { EventPoster } from '@/components/events/event-poster';
import { hasEventEnded } from '@/lib/event-status';

export { PROFILE_TABS, isProfileTab, type ProfileTab } from './profile-tabs';

export const SectionHeading = ({
  label,
  count,
  href,
}: {
  label: string;
  count?: number;
  href?: string;
}) => (
  <h2 className="mb-2 flex items-center gap-2 font-mono text-xs tracking-widest text-pcnGreen-500 uppercase">
    <span className="text-pcnGreen/60">#</span>
    {label}
    {count !== undefined && <span className="text-muted-foreground/60">({count})</span>}
    <span className="h-px flex-1 bg-pcnGreen-200" />
    {href && (
      <ProfileTabLink
        href={href}
        className="flex items-center gap-0.5 tracking-normal text-pcnGreen-700 normal-case hover:text-pcnGreen"
      >
        ver todo
        <ChevronRight className="size-3" />
      </ProfileTabLink>
    )}
  </h2>
);

export const EmptyLine = ({ children }: { children: React.ReactNode }) => (
  <p className="border border-dashed border-pcnGreen-200 px-3 py-4 font-mono text-xs text-muted-foreground">
    <span className="text-pcnGreen-500">$ </span>
    {children}
  </p>
);

export const ProfileStat = ({
  label,
  value,
  href,
}: {
  label: string;
  value: string | number;
  href?: string;
}) => {
  const content = (
    <>
      <p className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
        {label}
      </p>
      <p className="font-mono text-2xl font-semibold text-pcnGreen tabular-nums text-glow">
        {value}
      </p>
    </>
  );
  return href ? (
    <ProfileTabLink
      href={href}
      className={cn(ruledCellClassName, 'block px-3 py-2.5 hover:shadow-[inset_2px_0_0_#04f4be]')}
    >
      {content}
    </ProfileTabLink>
  ) : (
    <RuledCell className="px-3 py-2.5">{content}</RuledCell>
  );
};

export type ProfileProject = {
  id: string;
  title: string;
  description: string;
  logoUrl: string;
  techStack: string[];
  // Rol cargado en el proyecto, o 'autor' / 'colaborador' si no se cargó ninguno.
  role: string;
};

export const ProjectRows = ({ projects }: { projects: ProfileProject[] }) => (
  <RuledGrid className="grid-cols-1 xl:grid-cols-2">
    {projects.map((project) => (
      <Link
        key={project.id}
        href={`/proyectos?q=${encodeURIComponent(project.title)}`}
        className={cn(
          ruledCellClassName,
          'flex group gap-3 p-3 hover:shadow-[inset_2px_0_0_#04f4be]',
        )}
      >
        <span
          className={cn(
            'flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-[22%] transition-shadow group-hover:shadow-[0_0_22px_-4px_rgba(4,244,190,0.75)]',
            !project.logoUrl && 'bg-white',
          )}
        >
          {project.logoUrl ? (
            <Image
              src={project.logoUrl}
              alt=""
              width={112}
              height={112}
              className="h-full w-full scale-[1.06] object-cover"
            />
          ) : (
            <span className="font-mono text-lg font-bold text-black">
              {project.title.slice(0, 2).toUpperCase()}
            </span>
          )}
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="flex items-center gap-2 font-mono text-sm">
            <span className="truncate font-semibold group-hover:text-pcnGreen">
              {project.title}
            </span>
            <span className="max-w-[50%] shrink-0 truncate border border-pcnGreen-200 px-1 text-[10px] leading-4 text-pcnGreen-600">
              {project.role}
            </span>
          </span>
          <span className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {project.description}
          </span>
          {project.techStack.length > 0 && (
            <span className="truncate font-mono text-[11px] text-muted-foreground/70">
              <span className="text-pcnGreen-500"># </span>
              {project.techStack.join(' · ')}
            </span>
          )}
        </span>
      </Link>
    ))}
  </RuledGrid>
);

export type ProfileEvent = Awaited<ReturnType<typeof fetchEvents>>[number];

const EventGroup = ({
  label,
  count,
  children,
}: {
  label?: string;
  count: number;
  children: React.ReactNode;
}) => (
  <div>
    {label && (
      <h3 className="mb-2 font-mono text-[11px] text-muted-foreground">
        <span className="text-pcnGreen-500">{'// '}</span>
        {label} <span className="text-muted-foreground/60">({count})</span>
      </h3>
    )}
    {children}
  </div>
);

// Events the person organized, shown like on /eventos: the ones still ahead as posters, soonest
// first, and the past ones as framed flyers in the museum, newest first.
export const OrganizedEvents = ({ events }: { events: ProfileEvent[] }) => {
  const now = new Date();
  const upcoming = events.filter((event) => !hasEventEnded(event, now)).reverse();
  const past = events.filter((event) => hasEventEnded(event, now));
  // Labels only when there's something to tell apart.
  const labelled = upcoming.length > 0 && past.length > 0;

  return (
    <div className="flex flex-col gap-6">
      {upcoming.length > 0 && (
        <EventGroup label={labelled ? 'próximos' : undefined} count={upcoming.length}>
          <RuledGrid className="grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
            {upcoming.map((event) => (
              <EventPoster key={event.id} event={event} />
            ))}
          </RuledGrid>
        </EventGroup>
      )}
      {past.length > 0 && (
        <EventGroup label={labelled ? 'realizados' : undefined} count={past.length}>
          <RuledGrid className="grid-cols-2 md:grid-cols-3">
            {past.map((event) => (
              <EventExhibit key={event.id} event={event} />
            ))}
          </RuledGrid>
        </EventGroup>
      )}
    </div>
  );
};

export type ProfilePhoto = {
  id: string;
  kind: 'PHOTO' | 'VIDEO';
  description: string | null;
  thumbUrl: string;
};

// Square thumbnails of the photos and videos the person was tagged in, each opening its page.
// `className` overrides the column count (e.g. the overview preview uses fewer, larger columns).
export const PhotoGrid = ({
  photos,
  className,
}: {
  photos: ProfilePhoto[];
  className?: string;
}) => (
  <RuledGrid className={cn('grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4', className)}>
    {photos.map((photo) => (
      <Link
        key={photo.id}
        href={`/galeria/${photo.id}`}
        className={cn(ruledCellClassName, 'block group p-1')}
      >
        <span className="relative block aspect-square overflow-hidden bg-black">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo.thumbUrl}
            alt={photo.description ?? 'Foto de la comunidad'}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover brightness-[0.85] transition duration-300 group-hover:scale-[1.04] group-hover:brightness-100"
          />
          {photo.kind === 'VIDEO' && <VideoBadge />}
        </span>
      </Link>
    ))}
  </RuledGrid>
);

export const ConversationRows = ({ conversations }: { conversations: Conversation[] }) => (
  <RuledGrid className="grid-cols-1 xl:grid-cols-2">
    {conversations.map((conversation) => (
      <Link
        key={`${conversation.date}-${conversation.title}`}
        href={conversationHref(conversation)}
        className={cn(
          ruledCellClassName,
          'flex group flex-col gap-1 p-3 hover:shadow-[inset_2px_0_0_#04f4be]',
        )}
      >
        <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
          <time dateTime={conversation.date}>{conversation.date}</time>
          <span className="text-muted-foreground/60">
            {' '}
            · {conversation.participants.length} participantes
          </span>
        </span>
        <span className="font-mono text-sm leading-snug font-semibold group-hover:text-pcnGreen">
          {conversation.title}
        </span>
        <span className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {conversation.summary}
        </span>
      </Link>
    ))}
  </RuledGrid>
);

const BAR_WIDTH = 24;

export const ContributionStats = ({
  contributions,
  totals,
  detailed = false,
}: {
  contributions: ContributorStat[];
  totals: { mergedPrs: number; commits: number };
  /** In the contributions tab: also what they did, PR by PR. */
  detailed?: boolean;
}) => {
  const mergedPrs = contributions.reduce((sum, c) => sum + c.mergedPrs, 0);
  const commits = contributions.reduce((sum, c) => sum + c.commits, 0);
  // `null` while GitHub is still computing the per-author stats.
  const linesAdded = contributions.some((c) => c.linesAdded === null)
    ? null
    : contributions.reduce((sum, c) => sum + (c.linesAdded ?? 0), 0);
  // Capped: with several linked logins or a stale total, the share could go past 100% and break
  // the bar.
  const share = totals.mergedPrs > 0 ? Math.min(1, mergedPrs / totals.mergedPrs) : 0;
  const filled = Math.round(share * BAR_WIDTH);

  return (
    <div className="space-y-3">
      <RuledGrid className="grid-cols-2 sm:grid-cols-4">
        <ProfileStat label="PRs mergeadas" value={mergedPrs} />
        <ProfileStat label="commits" value={commits.toLocaleString('es-AR')} />
        <ProfileStat
          label="líneas agregadas"
          value={linesAdded === null ? '—' : `+${linesAdded.toLocaleString('es-AR')}`}
        />
        <ProfileStat label="del total" value={`${Math.round(share * 100)}%`} />
      </RuledGrid>
      <p className="font-mono text-xs text-muted-foreground">
        <span className="text-pcnGreen-500">$ </span>
        gh pr list --author {contributions.map((c) => c.login).join(',')} --state merged
        <span aria-hidden className="ml-2 tracking-tighter">
          <span className="text-pcnGreen">{'█'.repeat(filled)}</span>
          <span className="text-pcnGreen-200">{'░'.repeat(BAR_WIDTH - filled)}</span>
        </span>
      </p>
      <ul className="flex flex-wrap gap-2 font-mono text-xs">
        {contributions.map((contributor) => (
          <li key={contributor.login}>
            <a
              href={contributor.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 border border-pcnGreen-200 px-2 py-1 transition-colors hover:border-pcnGreen-600 hover:text-pcnGreen"
            >
              <Image src={contributor.avatarUrl} alt="" width={16} height={16} />
              {contributor.login}
              <ArrowUpRight className="size-3" />
            </a>
          </li>
        ))}
        <li>
          <Link
            href="/desarrollo"
            className="flex items-center gap-1 px-2 py-1 text-pcnGreen-700 hover:text-pcnGreen"
          >
            ~/desarrollo →
          </Link>
        </li>
      </ul>
      {detailed && <PullsSummary contributions={contributions} />}
    </div>
  );
};

const REPO_PULL_URL = 'https://github.com/programaconnosotros/pcn-website/pull';
const PULLS_PER_KIND = 6;
const pullDate = new Intl.DateTimeFormat('es-AR', { month: 'short', year: 'numeric' });

/**
 * What the person did in the repo: their merged PRs counted by kind (features, fixes, config…)
 * and the latest of each kind, linked to GitHub.
 */
function PullsSummary({ contributions }: { contributions: ContributorStat[] }) {
  const pulls = contributions
    .flatMap((contributor) => contributor.pulls ?? [])
    .sort((a, b) => b.mergedAt.localeCompare(a.mergedAt));
  if (pulls.length === 0) return null;
  const groups = groupPulls(pulls);

  return (
    <section aria-label="Qué hizo en el repo" className="space-y-3 pt-2">
      <p className="font-mono text-xs text-muted-foreground">
        <span className="text-pcnGreen-500">$ </span>git log --merges | resumen
      </p>
      <ul className="flex flex-wrap gap-1.5 font-mono text-[11px]">
        {groups.map((group) => (
          <li
            key={group.kind}
            className="flex items-center gap-1.5 rounded-sm border border-pcnGreen-200 px-2 py-1"
          >
            <span className="font-semibold text-pcnGreen tabular-nums">{group.pulls.length}</span>
            <span className="text-muted-foreground">{group.label}</span>
          </li>
        ))}
      </ul>
      <div className="grid gap-x-6 gap-y-4 md:grid-cols-2">
        {groups.map((group) => (
          <div key={group.kind}>
            <h4 className="mb-1.5 font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
              <span className="text-pcnGreen-500">{'// '}</span>
              {group.label}
            </h4>
            <ul className="space-y-1">
              {group.pulls.slice(0, PULLS_PER_KIND).map((pull) => (
                <li key={pull.number} className="flex items-baseline gap-2 text-xs">
                  <a
                    href={`${REPO_PULL_URL}/${pull.number}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 font-mono text-pcnGreen-700 hover:text-pcnGreen"
                  >
                    #{pull.number}
                  </a>
                  <span className="min-w-0 flex-1 text-foreground/85">
                    {pullSummary(pull.title)}
                  </span>
                  <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                    {pullDate.format(new Date(pull.mergedAt))}
                  </span>
                </li>
              ))}
              {group.pulls.length > PULLS_PER_KIND && (
                <li className="font-mono text-[11px] text-muted-foreground">
                  +{group.pulls.length - PULLS_PER_KIND} más
                </li>
              )}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
