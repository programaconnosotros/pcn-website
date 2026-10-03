import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, Check, Lock } from 'lucide-react';
import { getCurrentSession } from '@/actions/auth/get-current-session';
import { BadgeMedal } from '@/components/badges/badge-medal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PageTitle } from '@/components/ui/page-title';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { getAchievementMetrics } from '@/lib/achievement-metrics';
import { ACHIEVEMENTS, EMPTY_METRICS, isAchieved, type Achievement } from '@/lib/achievements';
import {
  AMBASSADOR_BADGE,
  BADGE_TONES,
  COFOUNDER_BADGE,
  isBadgeIcon,
  isBadgeTone,
  type DisplayBadge,
} from '@/lib/badges';
import prisma from '@/lib/prisma';
import { cn } from '@/lib/utils';
import { tabTitle } from '@/lib/tab-title';

export const revalidate = 0;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

const description =
  'Los logros de programaConNosotros: badges que se ganan participando en la comunidad, cuánto te falta para cada uno y quiénes ya los consiguieron.';

export const metadata: Metadata = {
  title: tabTitle.ls('logros'),
  description,
  openGraph: {
    title: 'Logros | programaConNosotros',
    description,
    url: `${SITE_URL}/logros`,
    type: 'website',
    siteName: 'programaConNosotros',
  },
  twitter: { card: 'summary_large_image', title: 'Logros | programaConNosotros', description },
};

// Holders shown as avatars before the rest fold into "ver todos".
const HOLDERS_PREVIEW = 12;

type Holder = { id: string; name: string; image: string | null };

const initials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

const byName = (a: Holder, b: Holder) => a.name.localeCompare(b.name, 'es');

const HolderAvatar = ({ holder }: { holder: Holder }) => (
  <Link href={`/perfil/${holder.id}`} title={holder.name} className="group/holder">
    <Avatar className="size-6 rounded-sm ring-1 ring-pcnGreen-200 transition-shadow group-hover/holder:ring-pcnGreen">
      <AvatarImage src={holder.image ?? undefined} alt={holder.name} />
      <AvatarFallback className="rounded-sm text-[8px]">{initials(holder.name)}</AvatarFallback>
    </Avatar>
  </Link>
);

function Holders({ holders, members }: { holders: Holder[]; members: number }) {
  if (holders.length === 0) {
    return (
      <p className="font-mono text-[11px] text-muted-foreground/70">
        <span className="text-pcnGreen-500">$ </span>nadie todavía. ¿vas a ser la primera persona?
      </p>
    );
  }
  const share = members > 0 ? (holders.length / members) * 100 : 0;
  const rest = holders.slice(HOLDERS_PREVIEW);
  return (
    <div className="flex flex-col gap-1.5">
      <p className="font-mono text-[11px] text-muted-foreground">
        <span className="text-foreground">{holders.length}</span>{' '}
        {holders.length === 1 ? 'miembro lo tiene' : 'miembros lo tienen'}
        <span className="text-muted-foreground/60">
          {' '}
          · {share < 1 ? '<1' : Math.round(share)}% de la comunidad
        </span>
      </p>
      <div className="flex flex-wrap gap-1">
        {holders.slice(0, HOLDERS_PREVIEW).map((holder) => (
          <HolderAvatar key={holder.id} holder={holder} />
        ))}
      </div>
      {rest.length > 0 && (
        <details className="group/more">
          <summary className="cursor-pointer list-none font-mono text-[11px] text-pcnGreen-700 hover:text-pcnGreen">
            <span className="group-open/more:hidden">+{rest.length} más</span>
            <span className="hidden group-open/more:inline">ocultar</span>
          </summary>
          <div className="mt-1 flex flex-wrap gap-1">
            {rest.map((holder) => (
              <HolderAvatar key={holder.id} holder={holder} />
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

/** A terminal-style progress bar: `[■■■■■□□□□□] 5/10`. */
function ProgressBar({ current, target }: { current: number; target: number }) {
  const percent = Math.round((current / target) * 100);
  return (
    <div className="flex items-center gap-2 font-mono text-[11px]">
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={target}
        aria-valuenow={current}
        className="h-1.5 flex-1 overflow-hidden bg-pcnGreen-200/40"
      >
        <div
          className="h-full bg-pcnGreen shadow-[0_0_8px_rgba(4,244,190,0.7)]"
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="shrink-0 tabular-nums text-muted-foreground">
        <span className="text-foreground">{current}</span>/{target}
      </span>
    </div>
  );
}

type Status = 'earned' | 'locked' | 'anonymous';

function BadgeRow({
  badge,
  status,
  children,
}: {
  badge: DisplayBadge;
  status: Status;
  children: React.ReactNode;
}) {
  const tone = BADGE_TONES[badge.tone];
  return (
    <article className={cn(ruledCellClassName, 'group/badge relative flex gap-4 p-4')}>
      {status === 'earned' && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-0.5"
          style={{ background: tone.base, boxShadow: `0 0 10px rgba(${tone.glow},0.8)` }}
        />
      )}
      <BadgeMedal
        icon={badge.icon}
        tone={badge.tone}
        className={cn(status === 'locked' && 'opacity-40 grayscale')}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3
              className="font-mono text-sm font-semibold uppercase tracking-wider"
              style={{ color: status === 'locked' ? undefined : tone.light }}
            >
              {badge.name}
            </h3>
            <p className="text-pretty text-xs leading-relaxed text-muted-foreground">
              {badge.description}
            </p>
          </div>
          {status === 'earned' && (
            <span className="flex shrink-0 items-center gap-1 border border-pcnGreen-600 px-1 font-mono text-[10px] uppercase leading-4 tracking-wider text-pcnGreen">
              <Check className="size-2.5" />
              tuyo
            </span>
          )}
          {status === 'locked' && (
            <Lock className="size-3.5 shrink-0 text-muted-foreground/60" aria-label="Bloqueado" />
          )}
        </div>
        {children}
      </div>
    </article>
  );
}

function AchievementRow({
  achievement,
  status,
  progress,
  holders,
  members,
}: {
  achievement: Achievement;
  status: Status;
  progress: { current: number; target: number } | null;
  holders: Holder[];
  members: number;
}) {
  return (
    <BadgeRow badge={achievement} status={status}>
      <p className="font-mono text-[11px] text-muted-foreground">
        <span className="text-pcnGreen-500">&gt; </span>
        {achievement.howTo}{' '}
        <Link
          href={achievement.href}
          className="inline-flex items-center gap-0.5 text-pcnGreen-700 hover:text-pcnGreen"
        >
          {achievement.href}
          <ArrowUpRight className="size-3" />
        </Link>
      </p>
      {progress && status === 'locked' && <ProgressBar {...progress} />}
      <Holders holders={holders} members={members} />
    </BadgeRow>
  );
}

export default async function LogrosPage() {
  const [session, metrics, members, roleHolders, customBadges] = await Promise.all([
    getCurrentSession(),
    getAchievementMetrics(),
    prisma.user.count(),
    prisma.user.findMany({
      where: { OR: [{ isCofounder: true }, { isAmbassador: true }] },
      select: { id: true, name: true, image: true, isCofounder: true, isAmbassador: true },
    }),
    prisma.badge.findMany({
      orderBy: { createdAt: 'asc' },
      include: {
        awards: { select: { user: { select: { id: true, name: true, image: true } } } },
      },
    }),
  ]);

  const viewerId = session?.user?.id;
  const viewerMetrics = viewerId ? metrics.get(viewerId) ?? EMPTY_METRICS : null;

  // Everyone who earned at least one achievement, to put a face on each holder.
  const users = await prisma.user.findMany({
    where: { id: { in: [...metrics.keys()] } },
    select: { id: true, name: true, image: true },
  });
  const holdersOf = (achievement: Achievement) =>
    users
      .filter((user) => {
        const userMetrics = metrics.get(user.id);
        return userMetrics && isAchieved(achievement, userMetrics);
      })
      .sort(byName);

  const rows = ACHIEVEMENTS.map((achievement) => {
    const status: Status = !viewerMetrics
      ? 'anonymous'
      : isAchieved(achievement, viewerMetrics)
        ? 'earned'
        : 'locked';
    return {
      achievement,
      status,
      progress: viewerMetrics ? achievement.progress(viewerMetrics) : null,
      holders: holdersOf(achievement),
    };
  });

  const earned = rows.filter(({ status }) => status === 'earned').length;
  // The locked achievement the viewer is closest to, to nudge them towards it.
  const next = rows
    .filter(({ status, progress }) => status === 'locked' && progress && progress.current > 0)
    .sort(
      (a, b) => b.progress!.current / b.progress!.target - a.progress!.current / a.progress!.target,
    )[0];

  const specialBadges: { badge: DisplayBadge; howTo: string; holders: Holder[] }[] = [
    {
      badge: COFOUNDER_BADGE,
      howTo: 'Solo para quienes fundaron la comunidad.',
      holders: roleHolders.filter((user) => user.isCofounder).sort(byName),
    },
    {
      badge: AMBASSADOR_BADGE,
      howTo: 'Se suma al programa PCN Ambassadors quien organiza e impulsa iniciativas.',
      holders: roleHolders.filter((user) => user.isAmbassador).sort(byName),
    },
    ...customBadges.map((badge) => ({
      badge: {
        id: badge.id,
        name: badge.name,
        description: badge.description,
        icon: isBadgeIcon(badge.icon) ? badge.icon : ('award' as const),
        tone: isBadgeTone(badge.tone) ? badge.tone : ('green' as const),
      },
      howTo: 'Lo otorga el equipo de PCN.',
      holders: badge.awards.map(({ user }) => user).sort(byName),
    })),
  ];

  return (
    <div className="flex flex-1 flex-col p-4 pt-0">
      <div className="mt-4">
        <PageTitle
          path="logros"
          meta={`${ACHIEVEMENTS.length} logros · se desbloquean participando en la comunidad`}
        />

        <RuledGrid className="mb-8 grid-cols-1 md:grid-cols-[1fr_auto]">
          <div className={cn(ruledCellClassName, 'p-4 font-mono text-xs')}>
            {viewerMetrics ? (
              <>
                <p className="text-muted-foreground">
                  <span className="text-pcnGreen-500">$ </span>
                  achievements --user {(session?.user?.name ?? 'vos').split(' ')[0].toLowerCase()}
                </p>
                <p className="mt-2 text-sm text-foreground">
                  Desbloqueaste{' '}
                  <span className="text-pcnGreen [text-shadow:0_0_10px_rgba(4,244,190,0.6)]">
                    {earned}/{ACHIEVEMENTS.length}
                  </span>{' '}
                  logros.
                </p>
                {next?.progress ? (
                  <p className="mt-1 text-muted-foreground">
                    <span className="text-pcnGreen-500">&gt; </span>
                    próximo: <span className="text-foreground">{next.achievement.name}</span> — te
                    faltan {next.progress.target - next.progress.current} para{' '}
                    {next.achievement.goal}.
                  </p>
                ) : (
                  earned < ACHIEVEMENTS.length && (
                    <p className="mt-1 text-muted-foreground">
                      <span className="text-pcnGreen-500">&gt; </span>
                      elegí un logro de la lista y empezá por ahí.
                    </p>
                  )
                )}
              </>
            ) : (
              <>
                <p className="text-sm text-foreground">
                  Participá en la comunidad y desbloqueá badges para tu perfil.
                </p>
                <p className="mt-1 text-muted-foreground">
                  <span className="text-pcnGreen-500">&gt; </span>
                  <Link
                    href="/autenticacion/iniciar-sesion"
                    className="text-pcnGreen hover:underline"
                  >
                    iniciá sesión
                  </Link>{' '}
                  para ver cuánto te falta para cada logro.
                </p>
              </>
            )}
          </div>
          {viewerMetrics && (
            <div
              className={cn(
                ruledCellClassName,
                'flex items-center justify-center gap-1 p-4 md:min-w-64',
              )}
            >
              {ACHIEVEMENTS.map((achievement, index) => (
                <span key={achievement.id} title={achievement.name} className="group/badge">
                  <BadgeMedal
                    icon={achievement.icon}
                    tone={achievement.tone}
                    size="sm"
                    className={cn(rows[index].status !== 'earned' && 'opacity-30 grayscale')}
                  />
                </span>
              ))}
            </div>
          )}
        </RuledGrid>

        <section className="mb-8">
          <h2 className="mb-2 font-mono text-xs font-semibold text-muted-foreground">
            <span className="text-pcnGreen-500">## </span>logros
            <span className="ml-1 text-muted-foreground/60">[{ACHIEVEMENTS.length}]</span>
          </h2>
          <RuledGrid className="grid-cols-1 lg:grid-cols-2">
            {rows.map((row) => (
              <AchievementRow key={row.achievement.id} {...row} members={members} />
            ))}
          </RuledGrid>
        </section>

        <section className="mb-14">
          <h2 className="font-mono text-xs font-semibold text-muted-foreground">
            <span className="text-pcnGreen-500">## </span>badges especiales
            <span className="ml-1 text-muted-foreground/60">[{specialBadges.length}]</span>
          </h2>
          <p className="mb-2 mt-1 text-xs text-muted-foreground">
            No se desbloquean solos: los entrega el equipo de programaConNosotros.
          </p>
          <RuledGrid className="grid-cols-1 lg:grid-cols-2">
            {specialBadges.map(({ badge, howTo, holders }) => (
              <BadgeRow
                key={badge.id}
                badge={badge}
                status={
                  !viewerId
                    ? 'anonymous'
                    : holders.some(({ id }) => id === viewerId)
                      ? 'earned'
                      : 'locked'
                }
              >
                <p className="font-mono text-[11px] text-muted-foreground">
                  <span className="text-pcnGreen-500">&gt; </span>
                  {howTo}
                </p>
                <Holders holders={holders} members={members} />
              </BadgeRow>
            ))}
          </RuledGrid>
        </section>
      </div>
    </div>
  );
}
