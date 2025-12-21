import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { Session, User } from '@prisma/client';
import { Heading2 } from '@/components/ui/heading-2';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, SquareTerminal, UserPlus, Calendar, CalendarCheck } from 'lucide-react';
import { formatDate } from '@/lib/utils';

const DashboardPage = async () => {
  const sessionId = cookies().get('sessionId')?.value;
  let session: (Session & { user: User }) | null = null;

  if (sessionId) {
    session = await prisma.session.findUnique({
      where: {
        id: sessionId,
      },
      include: {
        user: true,
      },
    });
  }

  // Obtener estadísticas
  const now = new Date();
  const oneMonthAgo = new Date(now);
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  const [
    totalUsers,
    totalAdvises,
    newUsersLastMonth,
    newAdvisesLastMonth,
    pastEvents,
    upcomingEvents,
    usersList,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.advise.count(),
    prisma.user.count({
      where: {
        createdAt: {
          gte: oneMonthAgo,
        },
      },
    }),
    prisma.advise.count({
      where: {
        createdAt: {
          gte: oneMonthAgo,
        },
      },
    }),
    prisma.event.count({
      where: {
        date: {
          lt: now,
        },
      },
    }),
    prisma.event.count({
      where: {
        date: {
          gte: now,
        },
      },
    }),
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        jobTitle: true,
        enterprise: true,
        countryOfOrigin: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50, // Limitar a 50 usuarios para no sobrecargar
    }),
  ]);

  const stats = [
    {
      title: 'Total de Usuarios',
      value: totalUsers,
      icon: Users,
      description: 'Usuarios registrados',
    },
    {
      title: 'Total de Consejos',
      value: totalAdvises,
      icon: SquareTerminal,
      description: 'Consejos compartidos',
    },
    {
      title: 'Usuarios Nuevos',
      value: newUsersLastMonth,
      icon: UserPlus,
      description: 'Último mes',
    },
    {
      title: 'Consejos Nuevos',
      value: newAdvisesLastMonth,
      icon: SquareTerminal,
      description: 'Último mes',
    },
    {
      title: 'Eventos Pasados',
      value: pastEvents,
      icon: Calendar,
      description: 'Eventos realizados',
    },
    {
      title: 'Eventos Próximos',
      value: upcomingEvents,
      icon: CalendarCheck,
      description: 'Eventos por venir',
    },
  ];

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/home">Inicio</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="mt-4">
          <div className="mb-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex w-full flex-row items-center justify-between">
              <Heading2 className="m-0">Dashboard</Heading2>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.title}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">{stat.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Usuarios</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                          Nombre
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                          Email
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                          Trabajo
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                          País
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                          Fecha de Registro
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersList.map((user) => (
                        <tr key={user.id} className="border-b hover:bg-muted/50">
                          <td className="px-4 py-3 text-sm">{user.name || '-'}</td>
                          <td className="px-4 py-3 text-sm">{user.email}</td>
                          <td className="px-4 py-3 text-sm">
                            {user.jobTitle && user.enterprise
                              ? `${user.jobTitle} en ${user.enterprise}`
                              : user.jobTitle || user.enterprise || '-'}
                          </td>
                          <td className="px-4 py-3 text-sm">{user.countryOfOrigin || '-'}</td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {formatDate(user.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;

