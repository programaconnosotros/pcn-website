import type { Metadata } from 'next';
import Link from 'next/link';
import { ReportQueue } from '@/components/moderation/report-queue';
import { PageTitle } from '@/components/ui/page-title';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { StickyHeader } from '@/components/ui/sticky-header';
import { requireAdminPage } from '@/lib/admin';
import { countModerationQueues, listPendingReports } from '@/lib/content-reports';
import { tabTitle } from '@/lib/tab-title';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: tabTitle.sudo('admin/moderacion'),
  robots: { index: false, follow: false },
};

// Everything waiting for an admin in one place: what members reported, plus how many photos,
// recommendations and talk proposals are waiting in their own review pages.
export default async function ModerationPage() {
  await requireAdminPage();
  const [groups, queues] = await Promise.all([listPendingReports(), countModerationQueues()]);

  const otherQueues = [
    { label: 'fotos', value: queues.photos, hint: 'por aprobar', href: '/galeria/pendientes' },
    {
      label: 'recomendaciones',
      value: queues.recommendations,
      hint: 'por publicar',
      href: '/admin/recomendaciones',
    },
    { label: 'propuestas', value: queues.proposals, hint: 'charlas por revisar', href: '/eventos' },
  ];

  return (
    <div className="flex flex-1 flex-col p-4 pt-0">
      <div className="mt-4">
        <StickyHeader>
          <PageTitle
            path={[{ label: 'admin', href: '/admin' }, { label: 'moderacion' }]}
            meta={
              queues.reports === 1 ? '1 reporte pendiente' : `${queues.reports} reportes pendientes`
            }
          />
        </StickyHeader>

        <RuledGrid className="mb-6 grid-cols-1 sm:grid-cols-3">
          {otherQueues.map((queue) => (
            <Link
              key={queue.label}
              href={queue.href}
              className={cn(ruledCellClassName, 'group p-3 font-mono transition-colors')}
            >
              <p className="text-[11px] tracking-wider text-muted-foreground uppercase">
                {queue.label}
              </p>
              <p
                className={cn(
                  'text-2xl font-semibold tabular-nums',
                  queue.value > 0 ? 'text-amber-400' : 'text-foreground',
                )}
              >
                {queue.value}
              </p>
              <p className="text-[11px] text-muted-foreground group-hover:text-pcnGreen">
                {queue.hint} →
              </p>
            </Link>
          ))}
        </RuledGrid>

        <h2 className="mb-2 font-mono text-xs tracking-wider text-muted-foreground uppercase">
          <span className="text-pcnGreen-500">{'// '}</span>reportes de la comunidad
        </h2>
        <ReportQueue groups={groups} />
      </div>
    </div>
  );
}
