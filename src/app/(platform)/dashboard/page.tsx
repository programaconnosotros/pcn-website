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
import {
  Users,
  SquareTerminal,
  UserPlus,
  Calendar,
  CalendarCheck,
  Heart,
  MessageCircle,
  Briefcase,
  Code,
  TrendingUp,
} from 'lucide-react';
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
    totalLikes,
    newLikesLastMonth,
    totalComments,
    newCommentsLastMonth,
    totalJobOffers,
    availableJobOffers,
    newJobOffersLastMonth,
    activeUsers,
    nextEvent,
    topLanguages,
    mostLikedAdvise,
    avgLikesPerAdvise,
    avgCommentsPerAdvise,
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
    prisma.like.count(),
    prisma.like.count({
      where: {
        createdAt: {
          gte: oneMonthAgo,
        },
      },
    }),
    prisma.comment.count(),
    prisma.comment.count({
      where: {
        createdAt: {
          gte: oneMonthAgo,
        },
      },
    }),
    prisma.jobOffers.count(),
    prisma.jobOffers.count({
      where: {
        available: true,
      },
    }),
    prisma.jobOffers.count({
      where: {
        createdAt: {
          gte: oneMonthAgo,
        },
      },
    }),
    prisma.user.count({
      where: {
        sessions: {
          some: {
            expires: {
              gt: now,
            },
          },
        },
      },
    }),
    prisma.event.findFirst({
      where: {
        date: {
          gte: now,
        },
      },
      orderBy: {
        date: 'asc',
      },
    }),
    prisma.userLanguage.groupBy({
      by: ['language'],
      _count: {
        language: true,
      },
      orderBy: {
        _count: {
          language: 'desc',
        },
      },
      take: 5,
    }),
    prisma.advise.findMany({
      include: {
        likes: true,
      },
    }).then((advises) => {
      if (advises.length === 0) return null;
      const sorted = advises.sort((a, b) => b.likes.length - a.likes.length);
      return sorted[0];
    }),
    prisma.like.count().then((likes) => {
      return prisma.advise.count().then((advises) => {
        return advises > 0 ? Math.round((likes / advises) * 10) / 10 : 0;
      });
    }),
    prisma.comment.count().then((comments) => {
      return prisma.advise.count().then((advises) => {
        return advises > 0 ? Math.round((comments / advises) * 10) / 10 : 0;
      });
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
      title: 'Usuarios Activos',
      value: activeUsers,
      icon: UserPlus,
      description: 'Con sesión activa',
    },
    {
      title: 'Usuarios Nuevos',
      value: newUsersLastMonth,
      icon: UserPlus,
      description: 'Último mes',
    },
    {
      title: 'Total de Consejos',
      value: totalAdvises,
      icon: SquareTerminal,
      description: 'Consejos compartidos',
    },
    {
      title: 'Consejos Nuevos',
      value: newAdvisesLastMonth,
      icon: SquareTerminal,
      description: 'Último mes',
    },
    {
      title: 'Total de Likes',
      value: totalLikes,
      icon: Heart,
      description: 'Likes totales',
    },
    {
      title: 'Likes Nuevos',
      value: newLikesLastMonth,
      icon: Heart,
      description: 'Último mes',
    },
    {
      title: 'Total de Comentarios',
      value: totalComments,
      icon: MessageCircle,
      description: 'Comentarios totales',
    },
    {
      title: 'Comentarios Nuevos',
      value: newCommentsLastMonth,
      icon: MessageCircle,
      description: 'Último mes',
    },
    {
      title: 'Promedio Likes/Consejo',
      value: avgLikesPerAdvise,
      icon: TrendingUp,
      description: 'Engagement promedio',
    },
    {
      title: 'Promedio Comentarios/Consejo',
      value: avgCommentsPerAdvise,
      icon: TrendingUp,
      description: 'Interacción promedio',
    },
    {
      title: 'Total de Ofertas',
      value: totalJobOffers,
      icon: Briefcase,
      description: 'Ofertas de trabajo',
    },
    {
      title: 'Ofertas Disponibles',
      value: availableJobOffers,
      icon: Briefcase,
      description: 'Ofertas activas',
    },
    {
      title: 'Ofertas Nuevas',
      value: newJobOffersLastMonth,
      icon: Briefcase,
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

          {mostLikedAdvise && (
            <div className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Consejo Más Popular
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm">{mostLikedAdvise.content}</p>
                    <p className="text-sm font-semibold text-muted-foreground">
                      {mostLikedAdvise.likes.length} likes
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {(nextEvent || topLanguages.length > 0) && (
            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {nextEvent && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarCheck className="h-5 w-5" />
                      Próximo Evento
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="font-semibold">{nextEvent.name}</p>
                      <p className="text-sm text-muted-foreground">{nextEvent.city}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(nextEvent.date)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {topLanguages.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Code className="h-5 w-5" />
                      Lenguajes Más Populares
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {topLanguages.map((lang, index) => (
                        <div key={lang.language} className="flex items-center justify-between">
                          <span className="text-sm">{lang.language}</span>
                          <span className="text-sm font-semibold text-muted-foreground">
                            {lang._count.language} usuarios
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

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

