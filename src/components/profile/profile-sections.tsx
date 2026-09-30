import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, ChevronRight } from 'lucide-react';
import type { Conversation } from '@/data/whatsapp-conversations';
import type { ContributorStat } from '@/lib/github-stats';
import { RuledCell, RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { cn } from '@/lib/utils';

export const PROFILE_TABS = [
  { id: 'resumen', label: 'resumen' },
  { id: 'proyectos', label: 'proyectos' },
  { id: 'consejos', label: 'consejos' },
  { id: 'charlas', label: 'charlas' },
  { id: 'conversaciones', label: 'conversaciones' },
  { id: 'contribuciones', label: 'contribuciones' },
] as const;

export type ProfileTab = (typeof PROFILE_TABS)[number]['id'];

export const isProfileTab = (value: unknown): value is ProfileTab =>
  PROFILE_TABS.some((tab) => tab.id === value);

// `[resumen] proyectos(3) consejos(12) …` — a row of links, so each tab has its own URL.
export const ProfileTabs = ({
  userId,
  active,
  counts,
}: {
  userId: string;
  active: ProfileTab;
  counts: Partial<Record<ProfileTab, number>>;
}) => (
  <nav
    aria-label="Secciones del perfil"
    className="-mx-4 mb-4 flex gap-1 overflow-x-auto border-b border-pcnGreen-200 px-4 font-mono text-xs [scrollbar-width:none] lg:mx-0 lg:px-0"
  >
    {PROFILE_TABS.map((tab) => {
      const isActive = tab.id === active;
      const count = counts[tab.id];
      return (
        <Link
          key={tab.id}
          href={tab.id === 'resumen' ? `/perfil/${userId}` : `/perfil/${userId}?tab=${tab.id}`}
          scroll={false}
          aria-current={isActive ? 'page' : undefined}
          className={cn(
            '-mb-px flex shrink-0 items-center gap-1 border-b-2 px-2 py-2 transition-colors',
            isActive
              ? 'border-pcnGreen text-pcnGreen'
              : 'border-transparent text-muted-foreground hover:text-foreground',
          )}
        >
          {isActive ? `[${tab.label}]` : tab.label}
          {count !== undefined && (
            <span className="text-[10px] tabular-nums text-muted-foreground/70">({count})</span>
          )}
        </Link>
      );
    })}
  </nav>
);

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
      <Link
        href={href}
        scroll={false}
        className="flex items-center gap-0.5 normal-case tracking-normal text-pcnGreen-700 hover:text-pcnGreen"
      >
        ver todo
        <ChevronRight className="size-3" />
      </Link>
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
    <Link
      href={href}
      scroll={false}
      className={cn(ruledCellClassName, 'block px-3 py-2.5 hover:shadow-[inset_2px_0_0_#04f4be]')}
    >
      {content}
    </Link>
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
  role: 'autor' | 'colaborador';
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
        <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-white p-1 ring-1 ring-pcnGreen-200 group-hover:ring-pcnGreen-600">
          {project.logoUrl ? (
            <Image
              src={project.logoUrl}
              alt=""
              width={32}
              height={32}
              className="h-full w-full object-contain"
            />
          ) : (
            <span className="font-mono text-xs font-bold text-black">
              {project.title.slice(0, 2).toUpperCase()}
            </span>
          )}
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="flex items-center gap-2 font-mono text-sm">
            <span className="truncate font-semibold group-hover:text-pcnGreen">
              {project.title}
            </span>
            <span className="shrink-0 border border-pcnGreen-200 px-1 text-[10px] leading-4 text-pcnGreen-600">
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

export const ConversationRows = ({ conversations }: { conversations: Conversation[] }) => (
  <RuledGrid className="grid-cols-1 xl:grid-cols-2">
    {conversations.map((conversation) => (
      <Link
        key={`${conversation.date}-${conversation.title}`}
        href={`/conversaciones?q=${encodeURIComponent(conversation.title)}`}
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
  const share = totals.mergedPrs > 0 ? mergedPrs / totals.mergedPrs : 0;
  const filled = Math.round(share * BAR_WIDTH);

  return (
    <div className="space-y-3">
      <RuledGrid className="grid-cols-3">
        <ProfileStat label="PRs mergeadas" value={mergedPrs} />
        <ProfileStat label="commits" value={commits} />
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
