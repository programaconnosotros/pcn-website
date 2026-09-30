'use server';

import { PageTitle } from '@/components/ui/page-title';
import { StickyHeader } from '@/components/ui/sticky-header';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { cn } from '@/lib/utils';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { fetchPageVisits, getPageVisitStats } from '@/actions/analytics/fetch-page-visits';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('es-AR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
};

const formatRelativeTime = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Hace menos de un minuto';
  if (minutes < 60) return `Hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
  if (hours < 24) return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
  return `Hace ${days} día${days > 1 ? 's' : ''}`;
};

const VisitasPage = async () => {
  // Verificar autenticación y permisos de admin
  const sessionId = (await cookies()).get('sessionId')?.value;

  if (!sessionId) {
    redirect('/home');
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true },
  });

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/home');
  }

  // Obtener datos
  const [visits, stats] = await Promise.all([fetchPageVisits(500), getPageVisitStats()]);

  return (
    <>
      <div className="flex flex-1 flex-col p-4 pt-0">
        <div className="mt-4">
          <StickyHeader>
            <PageTitle path="visitas" meta="visitas a las páginas principales" />
          </StickyHeader>

          <RuledGrid className="mb-4 grid-cols-2 lg:grid-cols-4">
            {[
              {
                label: 'total',
                value: stats.totalVisits.toLocaleString(),
                hint: 'visitas registradas',
              },
              { label: 'hoy', value: stats.visitsToday.toLocaleString(), hint: 'últimas 24 horas' },
              { label: 'páginas', value: stats.uniquePaths, hint: 'rutas únicas' },
              { label: 'usuarios', value: stats.uniqueUsers.toLocaleString(), hint: 'logueados' },
            ].map((stat) => (
              <div key={stat.label} className={cn(ruledCellClassName, 'p-3 font-mono')}>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  <span className="text-pcnGreen-500">{'// '}</span>
                  {stat.label}
                </p>
                <p className="mt-1 text-2xl font-semibold text-pcnGreen">{stat.value}</p>
                <p className="text-[11px] text-muted-foreground/70">{stat.hint}</p>
              </div>
            ))}
          </RuledGrid>

          <section className="mb-4 border border-pcnGreen-200">
            <h2 className="border-b border-pcnGreen-200 px-3 py-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">
              <span className="text-pcnGreen-500">{'// '}</span>páginas más visitadas
            </h2>
            <ol className="divide-y divide-pcnGreen-200 font-mono text-sm">
              {stats.topPages.map((page, index) => (
                <li key={page.path} className="flex items-center gap-3 px-3 py-1.5">
                  <span className="w-6 text-xs text-muted-foreground">{index + 1}</span>
                  <span className="flex-1 truncate">{page.path}</span>
                  <span className="text-xs text-pcnGreen">{page.count.toLocaleString()}</span>
                </li>
              ))}
            </ol>
          </section>

          <section className="mb-14 border border-pcnGreen-200">
            <h2 className="border-b border-pcnGreen-200 px-3 py-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">
              <span className="text-pcnGreen-500">{'// '}</span>visitas recientes (últimas 500)
            </h2>
            {visits.length === 0 ? (
              <p className="p-3 font-mono text-sm text-muted-foreground">
                Aún no hay visitas registradas.
              </p>
            ) : (
              <Table className="text-xs">
                <TableHeader>
                  <TableRow>
                    <TableHead className="h-8">Ruta</TableHead>
                    <TableHead className="h-8">Usuario</TableHead>
                    <TableHead className="h-8">Fecha</TableHead>
                    <TableHead className="h-8">Origen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visits.map((visit) => (
                    <TableRow key={visit.id}>
                      <TableCell className="py-1.5 font-mono">{visit.path}</TableCell>
                      <TableCell className="py-1.5">
                        {visit.user ? (
                          <span title={visit.user.email}>{visit.user.name}</span>
                        ) : (
                          <span className="text-muted-foreground">anónimo</span>
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap py-1.5">
                        {formatDate(visit.createdAt)}
                        <span className="ml-2 text-muted-foreground">
                          {formatRelativeTime(visit.createdAt)}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate py-1.5 text-muted-foreground">
                        {visit.referer ?? 'directo'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </section>
        </div>
      </div>
    </>
  );
};

export default VisitasPage;
