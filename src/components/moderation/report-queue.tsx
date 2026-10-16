'use client';

import { useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { reviewReports } from '@/actions/moderation/content-reports';
import { EmptyState } from '@/components/empty-state';
import { Button } from '@/components/ui/button';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { REPORT_REASONS, REPORTABLE_LABELS, type ReportReason } from '@/lib/content-report-types';
import type { ReportGroup } from '@/lib/content-reports';
import { actionErrorMessage } from '@/lib/rate-limit-messages';
import { cn } from '@/lib/utils';

const dateFormat = new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium', timeStyle: 'short' });

const reasonLabel = (reason: string) => REPORT_REASONS[reason as ReportReason] ?? reason;

function ReportCard({ group }: { group: ReportGroup }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const close = (status: 'RESOLVED' | 'DISMISSED') =>
    startTransition(async () => {
      try {
        await reviewReports({ contentType: group.contentType, contentId: group.contentId, status });
        toast.success(status === 'RESOLVED' ? 'Reporte resuelto' : 'Reporte descartado');
        router.refresh();
      } catch (error) {
        toast.error(actionErrorMessage(error, 'No se pudo cerrar el reporte'));
      }
    });

  return (
    <article className={cn(ruledCellClassName, 'flex flex-col gap-3 p-4')}>
      <header className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
        <span className="border border-amber-400/40 bg-amber-400/10 px-1.5 text-amber-400">
          {group.reports.length} {group.reports.length === 1 ? 'reporte' : 'reportes'}
        </span>
        <span className="text-muted-foreground">{REPORTABLE_LABELS[group.contentType]}</span>
      </header>

      {group.content ? (
        <Link
          href={group.content.href}
          className="text-sm font-semibold break-words hover:text-pcnGreen hover:underline"
        >
          {group.content.preview}
        </Link>
      ) : (
        <p className="font-mono text-xs text-muted-foreground">
          <span className="text-pcnGreen-500">$ </span>ya no existe: se borró después del reporte
        </p>
      )}

      <ul className="flex flex-col gap-2 border-t border-dashed border-pcnGreen-200 pt-3">
        {group.reports.map((report) => (
          <li key={report.id} className="font-mono text-xs">
            <p>
              <span className="text-amber-400">{reasonLabel(report.reason)}</span>
              <span className="text-muted-foreground">
                {' · '}
                {report.reporter ? (
                  <Link href={`/perfil/${report.reporter.id}`} className="hover:text-pcnGreen">
                    @{report.reporter.name}
                  </Link>
                ) : (
                  'cuenta eliminada'
                )}
                {' · '}
                {dateFormat.format(new Date(report.createdAt))}
              </span>
            </p>
            {report.details && (
              <p className="mt-1 font-sans text-sm text-foreground/80">{report.details}</p>
            )}
          </li>
        ))}
      </ul>

      <div className="mt-auto flex flex-wrap gap-2 pt-1">
        {group.content && (
          <Button asChild variant="outline" size="sm">
            <Link href={group.content.href}>revisar();</Link>
          </Button>
        )}
        <Button
          size="sm"
          variant="secondary"
          disabled={isPending}
          onClick={() => close('RESOLVED')}
        >
          resuelto();
        </Button>
        <Button size="sm" variant="ghost" disabled={isPending} onClick={() => close('DISMISSED')}>
          descartar();
        </Button>
      </div>
    </article>
  );
}

/** The pending reports on /admin/moderacion, one card per reported thing. */
export function ReportQueue({ groups }: { groups: ReportGroup[] }) {
  if (groups.length === 0) {
    return (
      <EmptyState
        command="ls ~/admin/moderacion/reportes"
        title="No hay reportes pendientes"
        description="Cuando alguien reporte un tema, un comentario, una foto o un perfil, aparece acá."
      />
    );
  }
  return (
    <RuledGrid className="mb-14 grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3">
      {groups.map((group) => (
        <ReportCard key={`${group.contentType}:${group.contentId}`} group={group} />
      ))}
    </RuledGrid>
  );
}
