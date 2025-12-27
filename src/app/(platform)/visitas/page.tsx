'use server';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Heading2 } from '@/components/ui/heading-2';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator as UISeparator } from '@/components/ui/separator';
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
import { Badge } from '@/components/ui/badge';
import { Eye, Users, TrendingUp, Calendar, Globe, User, ExternalLink } from 'lucide-react';

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('es-AR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
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
  const sessionId = cookies().get('sessionId')?.value;

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
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger />
          <UISeparator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/">Inicio</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Visitas</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="mt-4">
          <div className="mb-6">
            <Heading2 className="m-0">Visitas</Heading2>
            <p className="mt-2 text-sm text-muted-foreground">
              Estadísticas y registro de visitas a las páginas principales
            </p>
          </div>

          {/* Estadísticas */}
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-2 border-transparent bg-gradient-to-br from-white to-gray-50 transition-all duration-300 hover:scale-[1.02] hover:border-pcnPurple hover:shadow-xl dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-800 dark:hover:border-pcnGreen dark:hover:shadow-pcnGreen/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de visitas</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalVisits.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Todas las visitas registradas</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-transparent bg-gradient-to-br from-white to-gray-50 transition-all duration-300 hover:scale-[1.02] hover:border-pcnPurple hover:shadow-xl dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-800 dark:hover:border-pcnGreen dark:hover:shadow-pcnGreen/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Visitas hoy</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.visitsToday.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">últimas 24 horas</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-transparent bg-gradient-to-br from-white to-gray-50 transition-all duration-300 hover:scale-[1.02] hover:border-pcnPurple hover:shadow-xl dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-800 dark:hover:border-pcnGreen dark:hover:shadow-pcnGreen/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Páginas únicas</CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.uniquePaths}</div>
                <p className="text-xs text-muted-foreground">Rutas diferentes visitadas</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-transparent bg-gradient-to-br from-white to-gray-50 transition-all duration-300 hover:scale-[1.02] hover:border-pcnPurple hover:shadow-xl dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-800 dark:hover:border-pcnGreen dark:hover:shadow-pcnGreen/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Usuarios únicos</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.uniqueUsers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Usuarios logueados</p>
              </CardContent>
            </Card>
          </div>

          {/* Páginas más visitadas */}
          <Card className="mb-6 border-2 border-transparent bg-gradient-to-br from-white to-gray-50 transition-all duration-300 hover:scale-[1.02] hover:border-pcnPurple hover:shadow-xl dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-800 dark:hover:border-pcnGreen dark:hover:shadow-pcnGreen/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Páginas más visitadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stats.topPages.map((page, index) => (
                  <div
                    key={page.path}
                    className="flex items-center justify-between border-b py-2 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 text-sm font-medium text-muted-foreground">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium">{page.path}</span>
                    </div>
                    <Badge variant="outline">{page.count.toLocaleString()} visitas</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tabla de visitas recientes */}
          <Card className="border-2 border-transparent bg-gradient-to-br from-white to-gray-50 transition-all duration-300 hover:scale-[1.02] hover:border-pcnPurple hover:shadow-xl dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-800 dark:hover:border-pcnGreen dark:hover:shadow-pcnGreen/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Visitas recientes (últimas 500)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {visits.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Aún no hay visitas registradas.
                </p>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ruta</TableHead>
                        <TableHead>Usuario</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Origen</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {visits.map((visit) => (
                        <TableRow key={visit.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4 text-muted-foreground" />
                              <span>{visit.path}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {visit.user ? (
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="text-sm font-medium">{visit.user.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {visit.user.email}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <Badge variant="outline">Anónimo</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p>{formatDate(visit.createdAt)}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatRelativeTime(visit.createdAt)}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {visit.referer ? (
                              <div className="flex items-center gap-2">
                                <ExternalLink className="h-3 w-3 text-muted-foreground" />
                                <span className="max-w-[200px] truncate text-xs text-muted-foreground">
                                  {visit.referer}
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">Directo</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default VisitasPage;
