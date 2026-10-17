import type { Metadata } from 'next';
import Link from 'next/link';
import { PageTitle } from '@/components/ui/page-title';
import { StickyHeader } from '@/components/ui/sticky-header';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { requireAdminPage } from '@/lib/admin';
import { getSponsorClickReport, RECENT_DAYS } from '@/lib/sponsor-clicks-report';
import { SPONSOR_CLICK_SOURCES } from '@/lib/sponsor-clicks';
import { tabTitle } from '@/lib/tab-title';

export const metadata: Metadata = {
  title: tabTitle.sudo('admin/sponsors'),
  robots: { index: false, follow: false },
};

export const revalidate = 0;

const number = (value: number) => value.toLocaleString('es-AR');
const dateFormat = new Intl.DateTimeFormat('es-AR', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'America/Argentina/Buenos_Aires',
});

// How many clicks each sponsor got: the site's partners (home, /partners, the feed) and the
// sponsors of each event, so the admins can tell them how much traffic PCN sends them.
export default async function SponsorClicksPage() {
  await requireAdminPage();
  const rows = await getSponsorClickReport();
  const total = rows.reduce((sum, row) => sum + row.total, 0);

  return (
    <div className="flex flex-1 flex-col p-4 pt-0">
      <div className="mt-4 mb-14">
        <StickyHeader>
          <PageTitle
            path={[{ label: 'admin', href: '/admin' }, { label: 'sponsors' }]}
            meta={`${number(total)} clics en ${rows.length} sponsors`}
          />
        </StickyHeader>

        <div className="border border-pcnGreen-200">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>sponsor</TableHead>
                <TableHead>dónde</TableHead>
                <TableHead className="text-right">clics</TableHead>
                <TableHead className="text-right">últimos {RECENT_DAYS} días</TableHead>
                <TableHead>desde</TableHead>
                <TableHead>último clic</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={`${row.event?.id ?? 'partner'}-${row.name}`}>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell className="max-w-56 font-mono text-[11px] text-muted-foreground">
                    {row.event ? (
                      <Link
                        href={`/eventos/${row.event.id}`}
                        className="block truncate hover:text-pcnGreen"
                      >
                        evento: {row.event.name}
                      </Link>
                    ) : (
                      'partner del sitio'
                    )}
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {number(row.total)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-muted-foreground tabular-nums">
                    {number(row.recent)}
                  </TableCell>
                  <TableCell className="font-mono text-[11px] text-muted-foreground">
                    {SPONSOR_CLICK_SOURCES.filter((source) => row.bySource[source])
                      .map((source) => `${source} ${row.bySource[source]}`)
                      .join(' · ') || '—'}
                  </TableCell>
                  <TableCell className="font-mono text-[11px] whitespace-nowrap text-muted-foreground">
                    {row.lastClickAt ? dateFormat.format(row.lastClickAt) : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <p className="mt-2 font-mono text-[11px] text-muted-foreground">
          <span className="text-pcnGreen-500">$ </span>se cuenta cada clic en el logo o la card de
          un sponsor (inicio, /partners, el feed y la página de cada evento)
        </p>
      </div>
    </div>
  );
}
