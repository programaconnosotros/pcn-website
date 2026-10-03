import { cookies } from 'next/headers';
import { fetchErrors, getErrorStats } from '@/actions/errors/fetch-errors';
import { fetchLogs, getLogStats } from '@/actions/logs/fetch-logs';
import { PageTitle } from '@/components/ui/page-title';
import { StickyHeader } from '@/components/ui/sticky-header';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { cn } from '@/lib/utils';
import {
  AlertTriangle,
  Calendar,
  FileX,
  TrendingUp,
  Activity,
  Info,
  AlertCircle,
  Bug,
  type LucideIcon,
} from 'lucide-react';
import { MonitoringClient } from './monitoring-client';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { findSession } from '@/lib/session';

// Admin-only page: keep it out of search results.
export const metadata: Metadata = {
  title: 'sudo htop',
  robots: { index: false, follow: false },
};

type StatTile = {
  label: string;
  value: number;
  hint: string;
  icon: LucideIcon;
  iconClassName?: string;
};

const StatGroup = ({
  label,
  stats,
  className,
}: {
  label: string;
  stats: StatTile[];
  className?: string;
}) => (
  <section className="mb-4">
    <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.18em] text-pcnGreen">
      <span className="text-pcnGreen-500">{'// '}</span>
      {label}
    </p>
    <RuledGrid className={cn('grid-cols-2', className)}>
      {stats.map((stat) => (
        <div key={stat.label} className={cn(ruledCellClassName, 'p-3')}>
          <div className="flex items-center justify-between gap-2">
            <p className="truncate font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              {stat.label}
            </p>
            <stat.icon
              className={cn('h-3.5 w-3.5 shrink-0', stat.iconClassName ?? 'text-pcnGreen-500')}
            />
          </div>
          <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-pcnGreen">
            {stat.value.toLocaleString()}
          </p>
          <p className="text-[11px] text-muted-foreground/70">{stat.hint}</p>
        </div>
      ))}
    </RuledGrid>
  </section>
);

type Props = {
  searchParams: Promise<{
    errorPage?: string;
    logPage?: string;
    logLevel?: string;
  }>;
};

const MonitoreoPage = async ({ searchParams }: Props) => {
  const sessionId = (await cookies()).get('sessionId')?.value;

  if (!sessionId) {
    redirect('/home');
  }

  const session = await findSession(sessionId);

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/home');
  }

  const params = await searchParams;
  const errorPage = Math.max(1, parseInt(params.errorPage || '1', 10));
  const logPage = Math.max(1, parseInt(params.logPage || '1', 10));
  const logLevel = params.logLevel;

  const [errorsData, errorStats, logsData, logStats] = await Promise.all([
    fetchErrors(errorPage, 50),
    getErrorStats(),
    fetchLogs(logPage, 50, logLevel),
    getLogStats(),
  ]);

  const errorTiles: StatTile[] = [
    {
      label: 'Total de errores',
      value: errorStats.totalErrors,
      hint: 'Todos los registrados',
      icon: FileX,
    },
    {
      label: 'Sin resolver',
      value: errorStats.unresolvedErrors,
      hint: 'Requieren atención',
      icon: AlertTriangle,
      iconClassName: 'text-destructive',
    },
    { label: 'Hoy', value: errorStats.errorsToday, hint: 'Últimas 24 horas', icon: Calendar },
    {
      label: 'Esta semana',
      value: errorStats.errorsThisWeek,
      hint: 'Últimos 7 días',
      icon: TrendingUp,
    },
  ];

  const logTiles: StatTile[] = [
    { label: 'Total de logs', value: logStats.totalLogs, hint: 'Todos los logs', icon: Activity },
    {
      label: 'Info',
      value: logStats.logsByLevel.info,
      hint: 'Informativos',
      icon: Info,
      iconClassName: 'text-blue-500',
    },
    {
      label: 'Warnings',
      value: logStats.logsByLevel.warn,
      hint: 'Advertencias',
      icon: AlertCircle,
      iconClassName: 'text-yellow-500',
    },
    {
      label: 'Errors',
      value: logStats.logsByLevel.error,
      hint: 'Errores en logs',
      icon: AlertTriangle,
      iconClassName: 'text-destructive',
    },
    {
      label: 'Debug',
      value: logStats.logsByLevel.debug,
      hint: 'Logs de debug',
      icon: Bug,
      iconClassName: 'text-purple-500',
    },
  ];

  return (
    <>
      <div className="flex flex-1 flex-col overflow-visible p-4 pt-0">
        <div className="mt-4 overflow-visible">
          <StickyHeader>
            <PageTitle
              path="monitoreo"
              meta={`${errorStats.unresolvedErrors.toLocaleString()} errores sin resolver · ${logStats.totalLogs.toLocaleString()} logs`}
            />
          </StickyHeader>

          <StatGroup label="errores" stats={errorTiles} className="md:grid-cols-4" />
          <StatGroup label="logs" stats={logTiles} className="md:grid-cols-5" />

          <MonitoringClient
            errors={errorsData.errors}
            errorsPagination={errorsData.pagination}
            logs={logsData.logs}
            logsPagination={logsData.pagination}
            logLevel={logLevel}
            logCounts={{ total: logStats.totalLogs, ...logStats.logsByLevel }}
            unresolvedErrors={errorStats.unresolvedErrors}
          />
        </div>
      </div>
    </>
  );
};

export default MonitoreoPage;
