import Image from 'next/image';
import Link from 'next/link';
import { RuledCell, RuledGrid } from '@/components/ui/ruled-grid';
import { getCollaborationStats, type LanguageShare } from '@/lib/github-stats';
import { getIdentityMap } from '@/lib/identity-links';
import { getAdminUser } from '@/lib/admin';
import { cn } from '@/lib/utils';

const BAR_WIDTH = 20;
const WEEK_MS = 7 * 24 * 3_600_000;

const numberFormat = new Intl.NumberFormat('es-AR');
const relativeFormat = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });
const weekFormat = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short' });
const monthFormat = new Intl.DateTimeFormat('es-AR', { month: 'short', year: 'numeric' });
const longDateFormat = new Intl.DateTimeFormat('es-AR', { dateStyle: 'long' });

// 1234 → 1,2k; 1234567 → 1,2M. Line counts only need their order of magnitude in the list.
const compact = (value: number) => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace('.', ',')}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1).replace('.', ',')}k`;
  return String(value);
};

// Language colors as GitHub's linguist shows them; anything else falls back to a green shade.
const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  CSS: '#663399',
  Shell: '#89e051',
  Ruby: '#701516',
  Dockerfile: '#384d54',
  Makefile: '#427819',
  HTML: '#e34c26',
};
const languageColor = (name: string) => LANGUAGE_COLORS[name] ?? '#04f4be';

const formatPercent = (percent: number) =>
  percent < 0.1
    ? '<0,1%'
    : percent >= 10
      ? `${percent.toFixed(0)}%`
      : `${percent.toFixed(1).replace('.', ',')}%`;

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
  <RuledCell className="min-w-0 px-3 py-2.5">
    <p className="font-mono text-[11px] leading-tight wrap-break-word text-muted-foreground">
      {label}
    </p>
    <p className="font-mono text-xl font-semibold text-pcnGreen tabular-nums">{value}</p>
    {hint && <p className="font-mono text-[11px] leading-tight text-muted-foreground/70">{hint}</p>}
  </RuledCell>
);

// The weeks end at the snapshot, not today: the numbers only move when it is refreshed.
const WeeklyActivity = ({ weeks, until }: { weeks: number[]; until: string }) => {
  const max = Math.max(...weeks);
  const total = weeks.reduce((sum, count) => sum + count, 0);
  const activeWeeks = weeks.filter(Boolean).length;
  const now = Date.parse(until);

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
            <div key={index} className="relative flex h-full flex-1 group items-end">
              <div
                className={cn(
                  'w-full rounded-t-[2px] transition-colors',
                  count > 0 ? 'bg-pcnGreen-600 group-hover:bg-pcnGreen' : 'bg-pcnGreen-100',
                )}
                style={{ height: count > 0 ? `${Math.max(6, (count / max) * 100)}%` : '2px' }}
              />
              <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 border border-pcnGreen-200 bg-background px-1.5 py-0.5 font-mono text-[11px] whitespace-nowrap group-hover:block">
                {count} commits · sem. {weekFormat.format(weekStart)}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-1 flex justify-between font-mono text-[10px] text-muted-foreground/70">
        <span>{monthFormat.format(new Date(now - weeks.length * WEEK_MS))}</span>
        <span>{weekFormat.format(new Date(now))}</span>
      </div>
    </div>
  );
};

const Languages = ({
  languages,
  linesOfCode,
}: {
  languages: LanguageShare[];
  linesOfCode: number | null;
}) => (
  <div className="space-y-2">
    {linesOfCode !== null && (
      <p className="font-mono text-xs text-muted-foreground">
        <span className="text-pcnGreen-500">$ </span>git log --numstat | awk &apos;{'{'}a+=$1; d+=$2
        {'}'} END {'{'}print a-d{'}'}&apos;
        <span className="ml-2 text-foreground">{numberFormat.format(linesOfCode)}</span>
        <span className="ml-2">líneas de código</span>
      </p>
    )}
    {languages.length > 0 && (
      <>
        <p className="font-mono text-xs text-muted-foreground">
          <span className="text-pcnGreen-500">$ </span>github-linguist --breakdown
        </p>
        <div
          role="img"
          aria-label={`Lenguajes del repo: ${languages
            .map((language) => `${language.name} ${formatPercent(language.percent)}`)
            .join(', ')}`}
          className="flex h-2.5 gap-[2px] overflow-hidden"
        >
          {languages.map((language) => (
            <span
              key={language.name}
              title={`${language.name} ${formatPercent(language.percent)}`}
              className="h-full min-w-[3px] first:rounded-l-[2px] last:rounded-r-[2px]"
              style={{ flexGrow: language.percent, backgroundColor: languageColor(language.name) }}
            />
          ))}
        </div>
        <ul className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px]">
          {languages.map((language) => (
            <li key={language.name} className="flex items-center gap-1.5">
              <span
                aria-hidden
                className="size-2 rounded-full"
                style={{ backgroundColor: languageColor(language.name) }}
              />
              <span>{language.name}</span>
              <span className="text-muted-foreground tabular-nums">
                {formatPercent(language.percent)}
              </span>
            </li>
          ))}
        </ul>
      </>
    )}
  </div>
);

export const CollaborationStats = async () => {
  const [stats, profiles, admin] = await Promise.all([
    getCollaborationStats(),
    getIdentityMap('github'),
    getAdminUser(),
  ]);

  const contributors = stats.topContributors;
  const maxMerged = Math.max(...contributors.map((contributor) => contributor.mergedPrs));

  // Everything follows the width the stats get (a container query), not the screen: next to the
  // index or in a PCN OS window that's much less than the viewport, and the list used to overflow.
  return (
    <div className="@container space-y-5">
      <RuledGrid className="grid-cols-2 @md:grid-cols-3 @4xl:grid-cols-6">
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

      {stats.weeklyCommits.length > 0 && (
        <WeeklyActivity weeks={stats.weeklyCommits} until={stats.updatedAt} />
      )}

      {(stats.languages.length > 0 || stats.linesOfCode !== null) && (
        <Languages languages={stats.languages} linesOfCode={stats.linesOfCode} />
      )}

      <div>
        <p className="mb-2 font-mono text-xs text-muted-foreground">
          <span className="text-pcnGreen-500">$ </span>gh pr list --state merged | sort -rn
          <span className="ml-2">· {contributors.length} personas</span>
        </p>
        <ol className="space-y-1">
          {contributors.map((contributor, index) => {
            const bar = asciiBar(contributor.mergedPrs, maxMerged);
            const profile = profiles[contributor.login];
            return (
              <li
                key={contributor.login}
                className="flex min-w-0 group items-center gap-2 font-mono text-xs"
              >
                <span className="w-5 shrink-0 text-right text-muted-foreground/70 tabular-nums">
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
                  className="w-32 min-w-0 shrink truncate transition-colors hover:text-pcnGreen"
                >
                  {contributor.login}
                </Link>
                <span aria-hidden className="hidden shrink-0 tracking-tighter @2xl:inline">
                  <span className="text-pcnGreen-600 group-hover:text-pcnGreen">{bar.filled}</span>
                  <span className="text-pcnGreen-200">{bar.empty}</span>
                </span>
                <span className="ml-auto shrink-0 text-muted-foreground tabular-nums @2xl:ml-2 @2xl:w-40">
                  <span className="text-foreground">{contributor.mergedPrs}</span> PRs ·{' '}
                  {numberFormat.format(contributor.commits)} commits
                </span>
                {contributor.linesAdded !== null && contributor.linesDeleted !== null && (
                  <span
                    title={`${numberFormat.format(contributor.linesAdded)} líneas agregadas, ${numberFormat.format(contributor.linesDeleted)} eliminadas`}
                    className="hidden w-28 shrink-0 tabular-nums @3xl:inline"
                  >
                    <span className="text-pcnGreen-600">+{compact(contributor.linesAdded)}</span>{' '}
                    <span className="text-red-400/80">−{compact(contributor.linesDeleted)}</span>
                  </span>
                )}
                {contributor.firstContributionWeek && (
                  <span
                    title={`Primer commit: semana del ${longDateFormat.format(new Date(contributor.firstContributionWeek))}`}
                    className="hidden w-28 shrink-0 text-muted-foreground @4xl:inline"
                  >
                    desde {monthFormat.format(new Date(contributor.firstContributionWeek))}
                  </span>
                )}
                {profile && (
                  <Link
                    href={`/perfil/${profile.id}`}
                    title={`Ver el perfil de ${profile.name} en PCN`}
                    className="hidden min-w-0 shrink truncate text-pcnGreen-700 transition-colors hover:text-pcnGreen @lg:inline @lg:max-w-40"
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
        repo creado {timeAgo(stats.createdAt)} · datos de GitHub al{' '}
        {longDateFormat.format(new Date(stats.updatedAt))}
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
  <div className="@container space-y-5">
    <RuledGrid className="grid-cols-2 @md:grid-cols-3 @4xl:grid-cols-6">
      {Array.from({ length: 6 }, (_, index) => (
        <RuledCell key={index} className="h-[74px] animate-pulse bg-pcnGreen-50" />
      ))}
    </RuledGrid>
    <div className="h-24 animate-pulse bg-pcnGreen-50" />
  </div>
);
