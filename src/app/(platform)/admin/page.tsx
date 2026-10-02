import type { Metadata } from 'next';
import Link from 'next/link';
import { AlertTriangle, ChevronRight } from 'lucide-react';
import prisma from '@/lib/prisma';
import { requireAdminPage } from '@/lib/admin';
import { OS_PROGRAMS } from '@/components/os/programs';
import { DailyBars, type DailyCount } from '@/components/admin/daily-bars';
import { PageTitle } from '@/components/ui/page-title';
import { StickyHeader } from '@/components/ui/sticky-header';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableTag,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Panel',
  robots: { index: false, follow: false },
};

export const revalidate = 0;

const DAY_MS = 86_400_000;
const CHART_DAYS = 30;
const TZ = 'America/Argentina/Buenos_Aires';

const relativeFormat = new Intl.RelativeTimeFormat('es', { numeric: 'auto', style: 'short' });
const dateFormat = new Intl.DateTimeFormat('es-AR', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  timeZone: TZ,
});
const timeFormat = new Intl.DateTimeFormat('es-AR', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: TZ,
});

const timeAgo = (date: Date) => {
  const minutes = Math.round((date.getTime() - Date.now()) / 60_000);
  if (Math.abs(minutes) < 60) return relativeFormat.format(minutes, 'minute');
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 48) return relativeFormat.format(hours, 'hour');
  return relativeFormat.format(Math.round(hours / 24), 'day');
};

// Counts per local day for the last CHART_DAYS days, filling the days without rows with 0.
const dailyCounts = async (table: 'PageVisit' | 'User', since: Date): Promise<DailyCount[]> => {
  const rows =
    table === 'PageVisit'
      ? await prisma.$queryRaw<{ day: string; count: number }[]>`
          SELECT to_char(("createdAt" AT TIME ZONE 'UTC') AT TIME ZONE ${TZ}, 'YYYY-MM-DD') AS day,
                 count(*)::int AS count
          FROM "PageVisit" WHERE "createdAt" >= ${since} GROUP BY 1`
      : await prisma.$queryRaw<{ day: string; count: number }[]>`
          SELECT to_char(("createdAt" AT TIME ZONE 'UTC') AT TIME ZONE ${TZ}, 'YYYY-MM-DD') AS day,
                 count(*)::int AS count
          FROM "User" WHERE "createdAt" >= ${since} GROUP BY 1`;
  const byDay = new Map(rows.map((row) => [row.day, row.count]));
  const localDay = new Intl.DateTimeFormat('en-CA', { timeZone: TZ });
  return Array.from({ length: CHART_DAYS }, (_, index) => {
    const day = new Date(Date.now() - (CHART_DAYS - 1 - index) * DAY_MS);
    return { day, count: byDay.get(localDay.format(day)) ?? 0 };
  });
};

const Kpi = ({
  label,
  value,
  hint,
  href,
  alert,
}: {
  label: string;
  value: string | number;
  hint: string;
  href: string;
  alert?: boolean;
}) => (
  <Link
    href={href}
    className={cn(
      ruledCellClassName,
      'group relative block px-3 py-2.5 hover:shadow-[inset_2px_0_0_#04f4be]',
      alert && 'bg-red-500/[0.06] hover:shadow-[inset_2px_0_0_#f87171]',
    )}
  >
    <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
      {alert && <AlertTriangle className="size-3 text-red-400" aria-label="Requiere atención" />}
      {label}
    </p>
    <p
      className={cn(
        'font-mono text-2xl font-semibold tabular-nums',
        alert ? 'text-red-400' : 'text-glow text-pcnGreen',
      )}
    >
      {value}
    </p>
    <p className="truncate font-mono text-[10px] text-muted-foreground/70">{hint}</p>
    <ChevronRight className="absolute right-2 top-2.5 size-3.5 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:text-pcnGreen" />
  </Link>
);

const Panel = ({
  title,
  command,
  href,
  children,
  className,
}: {
  title: string;
  command: string;
  href?: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <section className={cn('min-w-0 border border-pcnGreen-200', className)}>
    <header className="flex items-center gap-3 border-b border-pcnGreen-200 bg-pcnGreen/[0.03] px-3 py-1.5 font-mono text-[11px]">
      <h2 className="font-semibold uppercase tracking-widest text-pcnGreen">{title}</h2>
      <span className="min-w-0 truncate text-muted-foreground">
        <span className="text-pcnGreen-600">$ </span>
        {command}
      </span>
      {href && (
        <Link
          href={href}
          className="ml-auto flex shrink-0 items-center gap-0.5 text-pcnGreen-700 hover:text-pcnGreen"
        >
          abrir
          <ChevronRight className="size-3" />
        </Link>
      )}
    </header>
    <div className="p-3">{children}</div>
  </section>
);

export default async function AdminPanelPage() {
  await requireAdminPage();

  const now = new Date();
  const dayAgo = new Date(now.getTime() - DAY_MS);
  const weekAgo = new Date(now.getTime() - 7 * DAY_MS);
  const chartStart = new Date(now.getTime() - CHART_DAYS * DAY_MS);

  const [
    usersTotal,
    usersWeek,
    visitsDay,
    visitsWeek,
    unresolvedErrors,
    errorsDay,
    pendingProposals,
    unreadNotifications,
    upcomingEvents,
    recentErrors,
    recentUsers,
    topPages,
    visitsByDay,
    signupsByDay,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.pageVisit.count({ where: { createdAt: { gte: dayAgo } } }),
    prisma.pageVisit.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.errorLog.count({ where: { resolved: false } }),
    prisma.errorLog.count({ where: { createdAt: { gte: dayAgo } } }),
    prisma.talkProposal.count({ where: { status: 'PENDING' } }),
    prisma.notification.count({ where: { read: false } }),
    prisma.event.findMany({
      where: { date: { gte: now }, deletedAt: null },
      orderBy: { date: 'asc' },
      take: 5,
      select: {
        id: true,
        name: true,
        date: true,
        capacity: true,
        _count: { select: { registrations: { where: { cancelledAt: null } } } },
      },
    }),
    prisma.errorLog.findMany({
      where: { resolved: false },
      orderBy: { createdAt: 'desc' },
      take: 6,
      select: { id: true, message: true, path: true, createdAt: true },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 6,
      select: { id: true, name: true, email: true, createdAt: true, emailVerified: true },
    }),
    prisma.pageVisit.groupBy({
      by: ['path'],
      where: { createdAt: { gte: weekAgo } },
      _count: { path: true },
      orderBy: { _count: { path: 'desc' } },
      take: 6,
    }),
    dailyCounts('PageVisit', chartStart),
    dailyCounts('User', chartStart),
  ]);

  const maxTopPage = Math.max(1, ...topPages.map((page) => page._count.path));
  const adminTools = OS_PROGRAMS.filter(
    (program) => program.group === 'Administración' && program.id !== 'admin',
  );

  return (
    <div className="flex flex-1 flex-col p-4 pt-0">
      <div className="mt-4">
        <StickyHeader>
          <PageTitle
            path="admin"
            meta={
              <>
                <span className="mr-1.5 inline-block size-1.5 animate-pulse rounded-full bg-pcnGreen align-middle shadow-[0_0_6px_#04f4be]" />
                estado del sitio · {timeFormat.format(now)}
              </>
            }
          />
        </StickyHeader>

        <RuledGrid className="mb-4 grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
          <Kpi
            label="usuarios"
            value={usersTotal}
            hint={`+${usersWeek} esta semana`}
            href="/usuarios"
          />
          <Kpi
            label="visitas 24h"
            value={visitsDay}
            hint={`${visitsWeek} en 7 días`}
            href="/visitas"
          />
          <Kpi
            label="errores"
            value={unresolvedErrors}
            hint={`${errorsDay} nuevos en 24h`}
            href="/monitoreo"
            alert={unresolvedErrors > 0}
          />
          <Kpi
            label="propuestas"
            value={pendingProposals}
            hint="charlas por revisar"
            href="/eventos"
          />
          <Kpi
            label="notificaciones"
            value={unreadNotifications}
            hint="sin leer"
            href="/notificaciones"
          />
          <Kpi label="eventos" value={upcomingEvents.length} hint="próximos" href="/eventos" />
        </RuledGrid>

        <div className="mb-14 grid gap-4 xl:grid-cols-2">
          <Panel title="tráfico" command={`visitas por día --last ${CHART_DAYS}d`} href="/visitas">
            <DailyBars days={visitsByDay} label="Visitas por día" unit="visitas" />
          </Panel>

          <Panel
            title="altas"
            command={`usuarios nuevos por día --last ${CHART_DAYS}d`}
            href="/usuarios"
          >
            <DailyBars days={signupsByDay} label="Usuarios nuevos por día" unit="altas" />
          </Panel>

          <Panel title="errores" command="tail -f errors.log --unresolved" href="/monitoreo">
            {recentErrors.length === 0 ? (
              <p className="py-4 text-center font-mono text-xs text-pcnGreen">
                ✓ sin errores pendientes
              </p>
            ) : (
              <ul className="-mx-3 -my-3 divide-y divide-pcnGreen-200/60 font-mono text-[11px]">
                {recentErrors.map((error) => (
                  <li key={error.id} className="flex items-center gap-2 px-3 py-1.5">
                    <TableTag tone="danger">err</TableTag>
                    <span className="min-w-0 flex-1 truncate" title={error.message}>
                      {error.message}
                    </span>
                    {error.path && (
                      <span className="hidden max-w-32 shrink-0 truncate text-muted-foreground sm:inline">
                        {error.path}
                      </span>
                    )}
                    <span className="shrink-0 tabular-nums text-muted-foreground/70">
                      {timeAgo(error.createdAt)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="eventos" command="ls ./eventos --upcoming">
            {upcomingEvents.length === 0 ? (
              <p className="py-4 text-center font-mono text-xs text-muted-foreground">
                no hay eventos próximos
              </p>
            ) : (
              <div className="-mx-3 -my-3">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>evento</TableHead>
                      <TableHead>fecha</TableHead>
                      <TableHead className="w-40">inscripciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {upcomingEvents.map((event) => {
                      const registered = event._count.registrations;
                      const fill = event.capacity ? Math.min(1, registered / event.capacity) : 0;
                      return (
                        <TableRow key={event.id}>
                          <TableCell className="max-w-48">
                            <Link
                              href={`/eventos/${event.id}/inscripciones`}
                              className="block truncate hover:text-pcnGreen"
                            >
                              {event.name}
                            </Link>
                          </TableCell>
                          <TableCell className="whitespace-nowrap font-mono text-[11px] text-muted-foreground">
                            {dateFormat.format(event.date)}
                          </TableCell>
                          <TableCell className="font-mono text-[11px] tabular-nums">
                            <span className="flex items-center gap-2">
                              {event.capacity ? (
                                <span className="h-1.5 w-16 bg-pcnGreen-100">
                                  <span
                                    className={cn(
                                      'block h-full',
                                      fill >= 1 ? 'bg-amber-400' : 'bg-pcnGreen',
                                    )}
                                    style={{ width: `${fill * 100}%` }}
                                  />
                                </span>
                              ) : null}
                              <span>
                                <span className="text-pcnGreen">{registered}</span>
                                {event.capacity ? `/${event.capacity}` : ''}
                              </span>
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </Panel>

          <Panel title="páginas" command="sort visitas --last 7d | head" href="/visitas">
            <ol className="space-y-1 font-mono text-[11px]">
              {topPages.map((page) => (
                <li key={page.path} className="flex items-center gap-2">
                  <span className="w-36 shrink-0 truncate" title={page.path}>
                    {page.path}
                  </span>
                  <span className="h-1.5 flex-1 bg-pcnGreen-100">
                    <span
                      className="block h-full bg-pcnGreen-600"
                      style={{ width: `${(page._count.path / maxTopPage) * 100}%` }}
                    />
                  </span>
                  <span className="w-10 shrink-0 text-right tabular-nums text-muted-foreground">
                    {page._count.path}
                  </span>
                </li>
              ))}
            </ol>
          </Panel>

          <Panel title="registros" command="tail users.log" href="/usuarios">
            <ul className="-mx-3 -my-3 divide-y divide-pcnGreen-200/60 font-mono text-[11px]">
              {recentUsers.map((user) => (
                <li key={user.id} className="flex items-center gap-2 px-3 py-1.5">
                  <span
                    title={user.emailVerified ? 'Email verificado' : 'Email sin verificar'}
                    className={cn(
                      'size-1.5 shrink-0 rounded-full',
                      user.emailVerified ? 'bg-pcnGreen' : 'bg-amber-500/70',
                    )}
                  />
                  <Link href={`/perfil/${user.id}`} className="truncate hover:text-pcnGreen">
                    {user.name}
                  </Link>
                  <span className="min-w-0 flex-1 truncate text-muted-foreground">
                    {user.email}
                  </span>
                  <span className="shrink-0 tabular-nums text-muted-foreground/70">
                    {timeAgo(user.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="herramientas" command="ls /usr/local/admin" className="xl:col-span-2">
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
              {adminTools.map((tool) => (
                <li key={tool.id}>
                  <Link
                    href={tool.url}
                    className="group flex items-center gap-2 border border-pcnGreen-200 p-2 font-mono text-xs transition-colors hover:border-pcnGreen-600 hover:bg-pcnGreen/[0.05]"
                  >
                    <span
                      className={cn(
                        'flex size-7 shrink-0 items-center justify-center rounded-sm bg-gradient-to-br text-white',
                        tool.color,
                      )}
                    >
                      <tool.icon className="size-4" />
                    </span>
                    <span className="truncate group-hover:text-pcnGreen">{tool.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}
