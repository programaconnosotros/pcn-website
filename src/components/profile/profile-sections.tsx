import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, ChevronRight } from 'lucide-react';
import type { Conversation } from '@/data/whatsapp-conversations';
import { conversationHref } from '@/components/conversations/conversation-utils';
import type { ContributorStat } from '@/lib/github-stats';
import { RuledCell, RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { cn } from '@/lib/utils';
import { ProfileTabLink } from './profile-tab-nav';
import { VideoBadge } from '@/components/photo-gallery/video-badge';

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
  <h2 className="mb-2 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-pcnGreen-500">
    <span className="text-pcnGreen-500/60">#</span>
    {label}
    {count !== undefined && <span className="text-muted-foreground/60">({count})</span>}
    <span className="h-px flex-1 bg-pcnGreen-200" />
    {href && (
      <ProfileTabLink
        href={href}
        className="flex items-center gap-0.5 normal-case tracking-normal text-pcnGreen-700 hover:text-pcnGreen"
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
      <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="text-glow font-mono text-2xl font-semibold tabular-nums text-pcnGreen">
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
          'group flex gap-3 p-3 hover:shadow-[inset_2px_0_0_#04f4be]',
        )}
      >
        <span
          className={cn(
            'flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-[22%] transition-[box-shadow] group-hover:shadow-[0_0_22px_-4px_rgba(4,244,190,0.75)]',
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

export type ProfileEvent = {
  id: string;
  name: string;
  date: Date;
  isOnline: boolean;
  placeName: string | null;
  city: string | null;
  flyerImages: string[];
};

// Events the person organized, newest first, each linking to its page.
export const OrganizedEventRows = ({ events }: { events: ProfileEvent[] }) => (
  <RuledGrid className="grid-cols-1">
    {events.map((event) => {
      const where = event.isOnline
        ? 'online'
        : [event.placeName, event.city].filter(Boolean).join(', ');
      return (
        <Link
          key={event.id}
          href={`/eventos/${event.id}`}
          className={cn(ruledCellClassName, 'group flex items-center gap-3 p-3')}
        >
          {event.flyerImages[0] && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={event.flyerImages[0]}
              alt=""
              loading="lazy"
              className="h-12 w-12 shrink-0 object-cover"
            />
          )}
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h3 className="truncate font-mono text-sm font-semibold group-hover:text-pcnGreen">
              {event.name}
            </h3>
            <p className="truncate font-mono text-[11px] text-muted-foreground/70">
              {new Date(event.date).toLocaleDateString('es-AR', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
              {where && (
                <>
                  <span className="text-pcnGreen-500"> @ </span>
                  {where}
                </>
              )}
            </p>
          </div>
          <ChevronRight className="size-4 shrink-0 text-muted-foreground group-hover:text-pcnGreen" />
        </Link>
      );
    })}
  </RuledGrid>
);

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
  <RuledGrid className={cn('grid-cols-3 sm:grid-cols-4 xl:grid-cols-6', className)}>
    {photos.map((photo) => (
      <Link
        key={photo.id}
        href={`/galeria/${photo.id}`}
        className={cn(ruledCellClassName, 'group block p-1')}
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
          'group flex flex-col gap-1 p-3 hover:shadow-[inset_2px_0_0_#04f4be]',
        )}
      >
        <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
          <time dateTime={conversation.date}>{conversation.date}</time>
          <span className="text-muted-foreground/60">
            {' '}
            · {conversation.participants.length} participantes
          </span>
        </span>
        <span className="font-mono text-sm font-semibold leading-snug group-hover:text-pcnGreen">
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
}: {
  contributions: ContributorStat[];
  totals: { mergedPrs: number; commits: number };
}) => {
  const mergedPrs = contributions.reduce((sum, c) => sum + c.mergedPrs, 0);
  const commits = contributions.reduce((sum, c) => sum + c.commits, 0);
  // `null` while GitHub is still computing the per-author stats.
  const linesAdded = contributions.some((c) => c.linesAdded === null)
    ? null
    : contributions.reduce((sum, c) => sum + (c.linesAdded ?? 0), 0);
  const share = totals.mergedPrs > 0 ? mergedPrs / totals.mergedPrs : 0;
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
    </div>
  );
};
