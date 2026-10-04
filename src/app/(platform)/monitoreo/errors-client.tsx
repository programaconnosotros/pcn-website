'use client';

import { Fragment, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Check } from 'lucide-react';
import { markErrorAsResolved } from '@/actions/errors/mark-as-resolved';
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
  type PaginationInfo,
  formatDate,
  prettyJson,
  TimeCell,
  ExpandButton,
  DetailBlock,
  FlagGroup,
  Pager,
  AsciiBar,
  SectionBar,
  hasSelection,
} from './table-parts';
import { actionErrorMessage } from '@/lib/rate-limit-messages';

type ErrorLog = {
  id: string;
  message: string;
  stack: string | null;
  path: string | null;
  userId: string | null;
  userAgent: string | null;
  ipAddress: string | null;
  metadata: string | null;
  resolved: boolean;
  resolvedAt: Date | null;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
  resolver: {
    id: string;
    name: string;
    email: string;
  } | null;
};

type ErrorsClientProps = {
  errors: ErrorLog[];
  pagination: PaginationInfo;
};

type Filter = 'sin-resolver' | 'resueltos';

const COLUMNS = 7;

export function ErrorsClient({ errors, pagination }: ErrorsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [markingAsResolved, setMarkingAsResolved] = useState<string | null>(null);
  const [expandedErrors, setExpandedErrors] = useState<Set<string>>(new Set());

  const unresolvedErrors = errors.filter((e) => !e.resolved);
  const resolvedErrors = errors.filter((e) => e.resolved);

  const [filter, setFilter] = useState<Filter>(
    unresolvedErrors.length > 0 ? 'sin-resolver' : 'resueltos',
  );
  const visible = filter === 'sin-resolver' ? unresolvedErrors : resolvedErrors;

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('errorPage', page.toString());
    router.push(`/monitoreo?${params.toString()}`);
  };

  const handleMarkAsResolved = async (errorId: string) => {
    setMarkingAsResolved(errorId);
    try {
      await markErrorAsResolved(errorId);
      toast.success('Error marcado como resuelto');
      router.refresh();
    } catch (error: any) {
      toast.error(actionErrorMessage(error, 'Error al marcar el error como resuelto', true));
    } finally {
      setMarkingAsResolved(null);
    }
  };

  const toggleExpand = (errorId: string) => {
    setExpandedErrors((current) => {
      const next = new Set(current);
      if (next.has(errorId)) next.delete(errorId);
      else next.add(errorId);
      return next;
    });
  };

  return (
    <section className="min-w-0 border border-pcnGreen-200">
      <SectionBar title="errores" command="tail -n 50 error.log">
        <AsciiBar value={resolvedErrors.length} total={errors.length} />
        <span>
          <span className="text-pcnGreen">{resolvedErrors.length}</span>/{errors.length} resueltos
        </span>
      </SectionBar>

      <div className="flex flex-wrap items-center gap-2 border-b border-pcnGreen-200 px-3 py-2">
        <FlagGroup<Filter>
          label="Filtrar por estado"
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'sin-resolver', count: unresolvedErrors.length },
            { value: 'resueltos', count: resolvedErrors.length },
          ]}
        />
      </div>

      <Table className="min-w-[760px] table-fixed font-mono">
        <TableHeader>
          <TableRow>
            <TableHead className="w-8 px-2">
              <span className="sr-only">Detalles</span>
            </TableHead>
            <TableHead className="w-24">cuándo</TableHead>
            <TableHead className="w-28">estado</TableHead>
            <TableHead>mensaje</TableHead>
            <TableHead className="w-40">ruta</TableHead>
            <TableHead className="w-32">usuario</TableHead>
            <TableHead className="w-10 px-2">
              <span className="sr-only">Acciones</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visible.length === 0 && (
            <TableRow>
              <TableCell colSpan={COLUMNS} className="h-16 text-center text-muted-foreground">
                <span className="text-pcnGreen-500">$ </span>
                {errors.length === 0
                  ? 'no hay errores registrados'
                  : filter === 'sin-resolver'
                    ? 'nada sin resolver en esta página'
                    : 'nada resuelto en esta página'}
              </TableCell>
            </TableRow>
          )}
          {visible.map((error) => {
            const expanded = expandedErrors.has(error.id);
            const detailsId = `error-details-${error.id}`;
            const pending = markingAsResolved === error.id;
            return (
              <Fragment key={error.id}>
                <TableRow
                  onClick={() => !hasSelection() && toggleExpand(error.id)}
                  data-state={expanded ? 'selected' : undefined}
                  className={cn(
                    'group cursor-pointer',
                    error.resolved && 'text-muted-foreground',
                    pending && 'animate-pulse',
                  )}
                >
                  <TableCell className="px-2">
                    <ExpandButton
                      expanded={expanded}
                      controls={detailsId}
                      label={error.message}
                      onToggle={() => toggleExpand(error.id)}
                    />
                  </TableCell>
                  <TimeCell date={error.createdAt} />
                  <TableCell>
                    {error.resolved ? (
                      <TableTag tone="green">resuelto</TableTag>
                    ) : (
                      <TableTag tone="danger">sin resolver</TableTag>
                    )}
                  </TableCell>
                  <TableCell>
                    <span
                      title={error.message}
                      className={cn('block truncate', !error.resolved && 'text-foreground')}
                    >
                      {error.message}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    <span title={error.path ?? undefined} className="block truncate">
                      {error.path ?? '—'}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    <span title={error.user?.email} className="block truncate">
                      {error.user?.name ?? '—'}
                    </span>
                  </TableCell>
                  <TableCell className="px-2 text-right">
                    {!error.resolved && (
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleMarkAsResolved(error.id);
                        }}
                        disabled={markingAsResolved !== null}
                        title="Marcar como resuelto"
                        className="rounded-sm p-1 text-muted-foreground opacity-0 transition hover:bg-pcnGreen/10 hover:text-pcnGreen focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-pcnGreen disabled:opacity-30 group-focus-within:opacity-100 group-hover:opacity-100"
                      >
                        <Check className="size-3.5" />
                        <span className="sr-only">Marcar como resuelto: {error.message}</span>
                      </button>
                    )}
                  </TableCell>
                </TableRow>
                {expanded && (
                  // Plain <tr>: the detail sub-row shouldn't get zebra/hover chrome of its own.
                  <tr id={detailsId} className="border-b border-pcnGreen-200/60 !bg-black/40">
                    <td colSpan={COLUMNS} className="px-3 py-2">
                      <div className="mb-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                        <span>
                          <span className="text-pcnGreen-600">fecha:</span>{' '}
                          {formatDate(error.createdAt)}
                        </span>
                        {error.user && (
                          <span>
                            <span className="text-pcnGreen-600">usuario:</span> {error.user.name}{' '}
                            &lt;{error.user.email}&gt;
                          </span>
                        )}
                        {error.ipAddress && (
                          <span>
                            <span className="text-pcnGreen-600">ip:</span> {error.ipAddress}
                          </span>
                        )}
                        {error.resolved && (
                          <span>
                            <span className="text-pcnGreen-600">resuelto:</span>{' '}
                            {error.resolvedAt ? formatDate(error.resolvedAt) : '—'}
                            {error.resolver && <> por {error.resolver.name}</>}
                          </span>
                        )}
                        {error.userAgent && (
                          <span className="min-w-0 basis-full truncate" title={error.userAgent}>
                            <span className="text-pcnGreen-600">ua:</span> {error.userAgent}
                          </span>
                        )}
                      </div>
                      <div className="grid gap-2">
                        <DetailBlock label="mensaje">{error.message}</DetailBlock>
                        {error.stack && <DetailBlock label="stack">{error.stack}</DetailBlock>}
                        {error.metadata && (
                          <DetailBlock label="metadata">{prettyJson(error.metadata)}</DetailBlock>
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

      <Pager pagination={pagination} noun="errores" onPageChange={handlePageChange} />
    </section>
  );
}
