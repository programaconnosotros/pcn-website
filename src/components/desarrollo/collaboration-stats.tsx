import Image from 'next/image';
import Link from 'next/link';
import { RuledCell, RuledGrid } from '@/components/ui/ruled-grid';
import { getCollaborationStats } from '@/lib/github-stats';
import { getIdentityMap } from '@/lib/identity-links';
import { getAdminUser } from '@/lib/admin';
import { cn } from '@/lib/utils';

const TOP_CONTRIBUTORS = 8;
const BAR_WIDTH = 20;
const WEEK_MS = 7 * 24 * 3_600_000;

const numberFormat = new Intl.NumberFormat('es-AR');
const relativeFormat = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });
const weekFormat = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short' });

const timeAgo = (iso: string) => {
  const days = Math.round((Date.parse(iso) - Date.now()) / (24 * 3_600_000));
  if (Math.abs(days) >= 365) return relativeFormat.format(Math.round(days / 365), 'year');
  if (Math.abs(days) >= 30) return relativeFormat.format(Math.round(days / 30), 'month');
  if (days === 0) return 'hoy';
  return relativeFormat.format(days, 'day');
};

const formatDuration = (hours: number) => {
  if (hours < 1) return `${Math.max(1, Math.round(hours * 60))}m`;
  if (hours < 48) return `${Math.round(hours)}h`;
  return `${Math.round(hours / 24)}d`;
};

// Terminal-style bar: filled blocks proportional to the value, dotted remainder.
const asciiBar = (value: number, max: number) => {
  const filled = max > 0 ? Math.max(value > 0 ? 1 : 0, Math.round((value / max) * BAR_WIDTH)) : 0;
  return { filled: '█'.repeat(filled), empty: '░'.repeat(BAR_WIDTH - filled) };
};

const Stat = ({ label, value, hint }: { label: string; value: string; hint?: string }) => (
  <RuledCell className="px-3 py-2.5">
    <p className="font-mono text-[11px] text-muted-foreground">{label}</p>
    <p className="font-mono text-xl font-semibold tabular-nums text-pcnGreen">{value}</p>
    {hint && <p className="truncate font-mono text-[11px] text-muted-foreground/70">{hint}</p>}
  </RuledCell>
);

const WeeklyActivity = ({ weeks }: { weeks: number[] }) => {
  const max = Math.max(...weeks);
  const total = weeks.reduce((sum, count) => sum + count, 0);
  const activeWeeks = weeks.filter(Boolean).length;
  const now = Date.now();

  return (
    <div>
      <p className="mb-2 font-mono text-xs text-muted-foreground">
        <span className="text-pcnGreen-500">$ </span>git log --since=&quot;52 weeks ago&quot; | wc
        -l
        <span className="ml-2 text-foreground">{numberFormat.format(total)}</span>
        <span className="ml-2">· {activeWeeks} semanas activas</span>
      </p>
      <div
        role="img"
        aria-label={`Commits por semana en el último año: ${numberFormat.format(total)} en total, máximo ${max} en una semana`}
        className="flex h-20 items-end gap-[2px] border-b border-pcnGreen-200"
      >
        {weeks.map((count, index) => {
          const weekStart = new Date(now - (weeks.length - index) * WEEK_MS);
          return (
            <div key={index} className="group relative flex h-full flex-1 items-end">
              <div
                className={cn(
                  'w-full rounded-t-[2px] transition-colors',
                  count > 0 ? 'bg-pcnGreen-600 group-hover:bg-pcnGreen' : 'bg-pcnGreen-100',
                )}
                style={{ height: count > 0 ? `${Math.max(6, (count / max) * 100)}%` : '2px' }}
              />
              <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap border border-pcnGreen-200 bg-background px-1.5 py-0.5 font-mono text-[11px] group-hover:block">
                {count} commits · sem. {weekFormat.format(weekStart)}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-1 flex justify-between font-mono text-[10px] text-muted-foreground/70">
        <span>hace 1 año</span>
        <span>hoy</span>
      </div>
    </div>
  );
};

export const CollaborationStats = async () => {
  const [stats, profiles, admin] = await Promise.all([
    getCollaborationStats(),
    getIdentityMap('github'),
    getAdminUser(),
  ]);

  if (!stats) {
    return (
      <p className="font-mono text-xs text-muted-foreground">
        <span className="text-pcnGreen-500">$ </span>
        No pudimos conectarnos con GitHub en este momento. Probá de nuevo más tarde.
      </p>
    );
  }

  const contributors = stats.topContributors.slice(0, TOP_CONTRIBUTORS);
  const maxMerged = Math.max(...contributors.map((contributor) => contributor.mergedPrs));

  return (
    <div className="space-y-5">
      <RuledGrid className="grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        <Stat label="commits" value={numberFormat.format(stats.commits)} />
        <Stat
          label="PRs mergeadas"
          value={numberFormat.format(stats.mergedPrs)}
          hint={`${stats.openPrs} abiertas`}
        />
        <Stat label="contribuidores" value={numberFormat.format(stats.contributors)} />
        <Stat
          label="merge (mediana)"
          value={stats.medianHoursToMerge === null ? '—' : formatDuration(stats.medianHoursToMerge)}
          hint="de PR abierta a merge"
        />
        <Stat label="stars" value={numberFormat.format(stats.stars)} />
        <Stat label="forks" value={numberFormat.format(stats.forks)} />
      </RuledGrid>

      {stats.weeklyCommits.length > 0 && <WeeklyActivity weeks={stats.weeklyCommits} />}

      <div>
        <p className="mb-2 font-mono text-xs text-muted-foreground">
          <span className="text-pcnGreen-500">$ </span>gh pr list --state merged | sort -rn | head -
          {contributors.length}
        </p>
        <ol className="space-y-1">
          {contributors.map((contributor, index) => {
            const bar = asciiBar(contributor.mergedPrs, maxMerged);
            const profile = profiles[contributor.login];
            return (
              <li
                key={contributor.login}
                className="group flex items-center gap-2 font-mono text-xs"
              >
                <span className="w-5 shrink-0 text-right tabular-nums text-muted-foreground/70">
                  {index + 1}
                </span>
                <Image
                  src={contributor.avatarUrl}
                  alt=""
                  width={18}
                  height={18}
                  className="shrink-0 grayscale transition group-hover:grayscale-0"
                />
                <Link
                  href={contributor.htmlUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`${contributor.login} en GitHub`}
                  className="w-32 shrink-0 truncate transition-colors hover:text-pcnGreen"
                >
                  {contributor.login}
                </Link>
                <span aria-hidden className="hidden shrink-0 tracking-tighter sm:inline">
                  <span className="text-pcnGreen-600 group-hover:text-pcnGreen">{bar.filled}</span>
                  <span className="text-pcnGreen-200">{bar.empty}</span>
                </span>
                <span className="ml-auto shrink-0 tabular-nums text-muted-foreground sm:ml-2">
                  <span className="text-foreground">{contributor.mergedPrs}</span> PRs ·{' '}
                  {numberFormat.format(contributor.commits)} commits
                </span>
                {profile && (
                  <Link
                    href={`/perfil/${profile.id}`}
                    title={`Ver el perfil de ${profile.name} en PCN`}
                    className="hidden shrink-0 truncate text-pcnGreen-700 transition-colors hover:text-pcnGreen md:inline md:max-w-40"
                  >
                    ~/{profile.name.split(' ')[0].toLowerCase()} →
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </div>

      <p className="font-mono text-[11px] text-muted-foreground/70">
        repo creado {timeAgo(stats.createdAt)} · último push {timeAgo(stats.pushedAt)} · datos de la
        API de GitHub, se actualizan cada hora
        {admin && (
          <>
            {' · '}
            <Link href="/vinculos" className="text-pcnGreen-700 hover:text-pcnGreen">
              vincular perfiles →
            </Link>
          </>
        )}
      </p>
    </div>
  );
};

export const CollaborationStatsSkeleton = () => (
  <div className="space-y-5">
    <RuledGrid className="grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
      {Array.from({ length: 6 }, (_, index) => (
        <RuledCell key={index} className="h-[74px] animate-pulse bg-pcnGreen-50" />
      ))}
    </RuledGrid>
    <div className="h-24 animate-pulse bg-pcnGreen-50" />
  </div>
);
