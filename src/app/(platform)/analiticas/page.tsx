import prisma from '@/lib/prisma';
import type { ReactNode } from 'react';
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
import { PageTitle } from '@/components/ui/page-title';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
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
import { cn, formatDate } from '@/lib/utils';

const SectionLabel = ({ children }: { children: ReactNode }) => (
  <p className="mb-2 mt-6 font-mono text-[11px] uppercase tracking-[0.18em] text-pcnGreen">
    <span className="text-pcnGreen-500">{'// '}</span>
    {children}
  </p>
);

const AnaliticasPage = async () => {
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
    prisma.advise
      .findMany({
        include: {
          likes: true,
        },
      })
      .then((advises) => {
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

  const highlightCount = [mostLikedAdvise, nextEvent, topLanguages.length > 0].filter(
    Boolean,
  ).length;
  const highlightCols = ['md:grid-cols-1', 'md:grid-cols-2', 'md:grid-cols-3'][highlightCount - 1];

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/">Inicio</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Analíticas</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col p-4 pt-0">
        <PageTitle
          path="analiticas"
          className="mt-4"
          meta={`${totalUsers} usuarios · ${totalAdvises} consejos · ${upcomingEvents} eventos próximos`}
        />

        <RuledGrid className="grid-cols-2 md:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.title} className={cn(ruledCellClassName, 'p-3')}>
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                    {stat.title}
                  </p>
                  <Icon className="h-3.5 w-3.5 shrink-0 text-pcnGreen-500" />
                </div>
                <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-pcnGreen">
                  {stat.value}
                </p>
                <p className="text-[11px] text-muted-foreground/70">{stat.description}</p>
              </div>
            );
          })}
        </RuledGrid>

        {(mostLikedAdvise || nextEvent || topLanguages.length > 0) && (
          <>
            <SectionLabel>destacados</SectionLabel>
            <RuledGrid className={cn('grid-cols-1', highlightCols)}>
              {mostLikedAdvise && (
                <div className={cn(ruledCellClassName, 'p-3')}>
                  <p className="flex items-center gap-1.5 font-mono text-xs font-semibold">
                    <Heart className="h-3.5 w-3.5 text-pcnGreen" />
                    consejo más popular
                  </p>
                  <p className="mt-2 line-clamp-4 text-sm">{mostLikedAdvise.content}</p>
                  <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                    {mostLikedAdvise.likes.length} likes
                  </p>
                </div>
              )}

              {nextEvent && (
                <div className={cn(ruledCellClassName, 'p-3')}>
                  <p className="flex items-center gap-1.5 font-mono text-xs font-semibold">
                    <CalendarCheck className="h-3.5 w-3.5 text-pcnGreen" />
                    próximo evento
                  </p>
                  <p className="mt-2 text-sm font-semibold">{nextEvent.name}</p>
                  <p className="font-mono text-[11px] text-muted-foreground">
                    {nextEvent.city} · {formatDate(nextEvent.date)}
                  </p>
                </div>
              )}

              {topLanguages.length > 0 && (
                <div className={cn(ruledCellClassName, 'p-3')}>
                  <p className="flex items-center gap-1.5 font-mono text-xs font-semibold">
                    <Code className="h-3.5 w-3.5 text-pcnGreen" />
                    lenguajes más populares
                  </p>
                  <ul className="mt-2 space-y-0.5">
                    {topLanguages.map((lang) => (
                      <li
                        key={lang.language}
                        className="flex items-center justify-between font-mono text-xs"
                      >
                        <span>{lang.language}</span>
                        <span className="text-muted-foreground">{lang._count.language}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </RuledGrid>
          </>
        )}

        <SectionLabel>usuarios · últimos {usersList.length}</SectionLabel>
        <div className="mb-14 overflow-x-auto border border-pcnGreen-200">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-pcnGreen-200">
                {['Nombre', 'Email', 'Trabajo', 'País', 'Registro'].map((heading) => (
                  <th
                    key={heading}
                    className="px-3 py-2 text-left font-mono text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {usersList.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-pcnGreen-200 last:border-b-0 hover:bg-pcnGreen/[0.04]"
                >
                  <td className="px-3 py-1.5 text-sm">{user.name || '-'}</td>
                  <td className="px-3 py-1.5 font-mono text-xs">{user.email}</td>
                  <td className="px-3 py-1.5 text-sm">
                    {user.jobTitle && user.enterprise
                      ? `${user.jobTitle} en ${user.enterprise}`
                      : user.jobTitle || user.enterprise || '-'}
                  </td>
                  <td className="px-3 py-1.5 text-sm">{user.countryOfOrigin || '-'}</td>
                  <td className="px-3 py-1.5 font-mono text-xs text-muted-foreground">
                    {formatDate(user.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default AnaliticasPage;
