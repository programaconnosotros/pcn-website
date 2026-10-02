'use client';

import { Fragment, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
import {
  DetailBlock,
  ExpandButton,
  FlagGroup,
  Pager,
  SectionBar,
  TimeCell,
  formatDate,
  hasSelection,
  prettyJson,
  type PaginationInfo,
} from './table-parts';

type AppLog = {
  id: string;
  level: string;
  message: string;
  path: string | null;
  userId: string | null;
  userAgent: string | null;
  ipAddress: string | null;
  metadata: string | null;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
};

const LEVELS = ['error', 'warn', 'info', 'debug'] as const;
type Level = (typeof LEVELS)[number];
type LevelFilter = 'todos' | Level;

export type LogCounts = { total: number } & Record<Level, number>;

type LogsClientProps = {
  logs: AppLog[];
  pagination: PaginationInfo;
  logLevel?: string;
  counts: LogCounts;
};

const LEVEL_TONE: Record<Level, 'danger' | 'warn' | 'muted' | 'purple'> = {
  error: 'danger',
  warn: 'warn',
  info: 'muted',
  debug: 'purple',
};

const isLevel = (value: unknown): value is Level => LEVELS.includes(value as Level);

const COLUMNS = 6;

export function LogsClient({ logs, pagination, logLevel, counts }: LogsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());
  // The level filter lives in the URL (`?logLevel=`) and is applied server-side, so the
  // current page already holds only matching rows.
  const filter: LevelFilter = isLevel(logLevel) ? logLevel : 'todos';

  const pushParams = (update: (_params: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams.toString());
    update(params);
    router.push(`/monitoreo?${params.toString()}`, { scroll: false });
  };

  const handlePageChange = (page: number) =>
    pushParams((params) => params.set('logPage', page.toString()));

  const handleFilterChange = (value: LevelFilter) =>
    pushParams((params) => {
      params.set('logPage', '1'); // Reset to the first page when the level changes.
      if (value === 'todos') params.delete('logLevel');
      else params.set('logLevel', value);
    });

  const toggleExpand = (logId: string) => {
    setExpandedLogs((current) => {
      const next = new Set(current);
      if (next.has(logId)) next.delete(logId);
      else next.add(logId);
      return next;
    });
  };

  return (
    <section className="min-w-0 border border-pcnGreen-200">
      <SectionBar
        title="logs"
        command={filter === 'todos' ? 'tail -n 50 app.log' : `grep level=${filter} app.log`}
      >
        {LEVELS.map((level) => (
          <span key={level} title={`${counts[level].toLocaleString()} ${level}`}>
            <span className={cn(level === 'error' && counts.error > 0 && 'text-red-400')}>
              {counts[level].toLocaleString()}
            </span>{' '}
            <span className="text-muted-foreground/60">{level}</span>
          </span>
        ))}
      </SectionBar>

      <div className="flex flex-wrap items-center gap-2 border-b border-pcnGreen-200 px-3 py-2">
        <FlagGroup<LevelFilter>
          label="Filtrar por nivel"
          value={filter}
          onChange={handleFilterChange}
          options={[
            { value: 'todos', count: counts.total },
            ...LEVELS.map((level) => ({ value: level, count: counts[level] })),
          ]}
        />
      </div>

      <Table className="min-w-[680px] table-fixed font-mono">
        <TableHeader>
          <TableRow>
            <TableHead className="w-8 px-2">
              <span className="sr-only">Detalles</span>
            </TableHead>
            <TableHead className="w-24">cuándo</TableHead>
            <TableHead className="w-20">nivel</TableHead>
            <TableHead>mensaje</TableHead>
            <TableHead className="w-40">ruta</TableHead>
            <TableHead className="w-32">usuario</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.length === 0 && (
            <TableRow>
              <TableCell colSpan={COLUMNS} className="h-16 text-center text-muted-foreground">
                <span className="text-pcnGreen-500">$ </span>
                {filter === 'todos' ? 'no hay logs registrados' : `no hay logs de nivel ${filter}`}
              </TableCell>
            </TableRow>
          )}
          {logs.map((log) => {
            const expanded = expandedLogs.has(log.id);
            const detailsId = `log-details-${log.id}`;
            return (
              <Fragment key={log.id}>
                <TableRow
                  onClick={() => !hasSelection() && toggleExpand(log.id)}
                  data-state={expanded ? 'selected' : undefined}
                  className={cn('cursor-pointer', log.level === 'debug' && 'text-muted-foreground')}
                >
                  <TableCell className="px-2">
                    <ExpandButton
                      expanded={expanded}
                      controls={detailsId}
                      label={log.message}
                      onToggle={() => toggleExpand(log.id)}
                    />
                  </TableCell>
                  <TimeCell date={log.createdAt} />
                  <TableCell>
                    <TableTag tone={isLevel(log.level) ? LEVEL_TONE[log.level] : 'muted'}>
                      {log.level}
                    </TableTag>
                  </TableCell>
                  <TableCell>
                    <span title={log.message} className="block truncate">
                      {log.message}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    <span title={log.path ?? undefined} className="block truncate">
                      {log.path ?? '—'}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    <span title={log.user?.email} className="block truncate">
                      {log.user?.name ?? '—'}
                    </span>
                  </TableCell>
                </TableRow>
                {expanded && (
                  // Plain <tr>: the detail sub-row shouldn't get zebra/hover chrome of its own.
                  <tr id={detailsId} className="border-b border-pcnGreen-200/60 !bg-black/40">
                    <td colSpan={COLUMNS} className="px-3 py-2">
                      <div className="mb-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                        <span>
                          <span className="text-pcnGreen-600">fecha:</span>{' '}
                          {formatDate(log.createdAt)}
                        </span>
                        {log.user && (
                          <span>
                            <span className="text-pcnGreen-600">usuario:</span> {log.user.name} &lt;
                            {log.user.email}&gt;
                          </span>
                        )}
                        {log.ipAddress && (
                          <span>
                            <span className="text-pcnGreen-600">ip:</span> {log.ipAddress}
                          </span>
                        )}
                        {log.userAgent && (
                          <span className="min-w-0 basis-full truncate" title={log.userAgent}>
                            <span className="text-pcnGreen-600">ua:</span> {log.userAgent}
                          </span>
                        )}
                      </div>
                      <div className="grid gap-2">
                        <DetailBlock label="mensaje">{log.message}</DetailBlock>
                        {log.metadata ? (
                          <DetailBlock label="metadata">{prettyJson(log.metadata)}</DetailBlock>
                        ) : (
                          <p className="text-[11px] text-muted-foreground/60">
                            <span className="text-pcnGreen-500/60">{'// '}</span>sin metadata
                          </p>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </TableBody>
      </Table>

      <Pager pagination={pagination} noun="logs" onPageChange={handlePageChange} />
    </section>
  );
}
