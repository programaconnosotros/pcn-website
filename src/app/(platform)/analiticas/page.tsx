import prisma from '@/lib/prisma';
import { requireAdminPage } from '@/lib/admin';
import type { ReactNode } from 'react';
import { PageTitle } from '@/components/ui/page-title';
import { StickyHeader } from '@/components/ui/sticky-header';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import {
  Users,
  SquareTerminal,
  UserPlus,
  Calendar,
  CalendarCheck,
  Heart,
  MessageCircle,
  MicVocal,
  Rocket,
  Ticket,
  Code,
  TrendingUp,
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import type { Metadata } from 'next';
import { tabTitle } from '@/lib/tab-title';

// Admin-only page: keep it out of search results.
export const metadata: Metadata = {
  title: tabTitle.sudo('analiticas'),
  robots: { index: false, follow: false },
};

const SectionLabel = ({ children }: { children: ReactNode }) => (
  <p className="mt-6 mb-2 font-mono text-[11px] tracking-[0.18em] text-pcnGreen uppercase">
    <span className="text-pcnGreen-500">{'// '}</span>
    {children}
  </p>
);

const AnaliticasPage = async () => {
  await requireAdminPage();

  // Obtener estadísticas
  const now = new Date();
  const oneMonthAgo = new Date(now);
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  const [
    totalUsers,
    totalAdvice,
    newUsersLastMonth,
    newAdviceLastMonth,
    pastEvents,
    upcomingEvents,
    totalLikes,
    newLikesLastMonth,
    totalComments,
    newCommentsLastMonth,
    totalProjects,
    totalTalks,
    activeRegistrations,
    activeUsers,
    nextEvent,
    topLanguages,
    mostLikedAdvice,
    avgLikesPerAdvice,
    avgCommentsPerAdvice,
    usersList,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.advice.count(),
    prisma.user.count({
      where: {
        createdAt: {
          gte: oneMonthAgo,
        },
      },
    }),
    prisma.advice.count({
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
    prisma.project.count(),
    prisma.talk.count(),
    prisma.eventRegistration.count({ where: { cancelledAt: null } }),
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
    prisma.advice
      .findMany({
        include: {
          likes: true,
        },
      })
      .then((advice) => {
        if (advice.length === 0) return null;
        const sorted = advice.sort((a, b) => b.likes.length - a.likes.length);
        return sorted[0];
      }),
    prisma.like.count().then((likes) => {
      return prisma.advice.count().then((advice) => {
        return advice > 0 ? Math.round((likes / advice) * 10) / 10 : 0;
      });
    }),
    prisma.comment.count().then((comments) => {
      return prisma.advice.count().then((advice) => {
        return advice > 0 ? Math.round((comments / advice) * 10) / 10 : 0;
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
      value: totalAdvice,
      icon: SquareTerminal,
      description: 'Consejos compartidos',
    },
    {
      title: 'Consejos Nuevos',
      value: newAdviceLastMonth,
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
      value: avgLikesPerAdvice,
      icon: TrendingUp,
      description: 'Engagement promedio',
    },
    {
      title: 'Promedio Comentarios/Consejo',
      value: avgCommentsPerAdvice,
      icon: TrendingUp,
      description: 'Interacción promedio',
    },
    {
      title: 'Proyectos',
      value: totalProjects,
      icon: Rocket,
      description: 'Publicados en /proyectos',
    },
    {
      title: 'Charlas',
      value: totalTalks,
      icon: MicVocal,
      description: 'Dadas en eventos',
    },
    {
      title: 'Inscripciones',
      value: activeRegistrations,
      icon: Ticket,
      description: 'Activas en eventos',
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

  const highlightCount = [mostLikedAdvice, nextEvent, topLanguages.length > 0].filter(
    Boolean,
  ).length;
  const highlightCols = ['md:grid-cols-1', 'md:grid-cols-2', 'md:grid-cols-3'][highlightCount - 1];

  return (
    <>
      <div className="flex flex-1 flex-col p-4 pt-0">
        <StickyHeader className="mt-4">
          <PageTitle
            path="analiticas"
            meta={`${totalUsers} usuarios · ${totalAdvice} consejos · ${upcomingEvents} eventos próximos`}
          />
        </StickyHeader>

        <RuledGrid className="grid-cols-2 md:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.title} className={cn(ruledCellClassName, 'p-3')}>
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
                    {stat.title}
                  </p>
                  <Icon className="h-3.5 w-3.5 shrink-0 text-pcnGreen-500" />
                </div>
                <p className="mt-1 font-mono text-2xl font-semibold text-pcnGreen tabular-nums">
                  {stat.value}
                </p>
                <p className="text-[11px] text-muted-foreground/70">{stat.description}</p>
              </div>
            );
          })}
        </RuledGrid>

        {(mostLikedAdvice || nextEvent || topLanguages.length > 0) && (
          <>
            <SectionLabel>destacados</SectionLabel>
            <RuledGrid className={cn('grid-cols-1', highlightCols)}>
              {mostLikedAdvice && (
                <div className={cn(ruledCellClassName, 'p-3')}>
                  <p className="flex items-center gap-1.5 font-mono text-xs font-semibold">
                    <Heart className="h-3.5 w-3.5 text-pcnGreen" />
                    consejo más popular
                  </p>
                  <p className="mt-2 line-clamp-4 text-sm">{mostLikedAdvice.content}</p>
                  <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                    {mostLikedAdvice.likes.length} likes
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
                    className="px-3 py-2 text-left font-mono text-[11px] font-medium tracking-wider text-muted-foreground uppercase"
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
