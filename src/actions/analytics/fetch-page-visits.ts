'use server';

import prisma from '@/lib/prisma';

export const fetchPageVisits = async (limit: number = 100) => {
  return prisma.pageVisit.findMany({
    take: limit,
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
};

export const getPageVisitStats = async () => {
  const now = new Date();
  const oneDayAgo = new Date(now);
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);
  const oneWeekAgo = new Date(now);
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const oneMonthAgo = new Date(now);
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  const [
    totalVisits,
    visitsToday,
    visitsThisWeek,
    visitsThisMonth,
    uniquePaths,
    topPages,
    visitsByUser,
  ] = await Promise.all([
    prisma.pageVisit.count(),
    prisma.pageVisit.count({
      where: {
        createdAt: {
          gte: oneDayAgo,
        },
      },
    }),
    prisma.pageVisit.count({
      where: {
        createdAt: {
          gte: oneWeekAgo,
        },
      },
    }),
    prisma.pageVisit.count({
      where: {
        createdAt: {
          gte: oneMonthAgo,
        },
      },
    }),
    prisma.pageVisit.groupBy({
      by: ['path'],
      _count: {
        path: true,
      },
    }),
    prisma.pageVisit.groupBy({
      by: ['path'],
      _count: {
        path: true,
      },
      orderBy: {
        _count: {
          path: 'desc',
        },
      },
      take: 10,
    }),
    prisma.pageVisit.groupBy({
      by: ['userId'],
      _count: {
        userId: true,
      },
      where: {
        userId: {
          not: null,
        },
      },
    }),
  ]);

  return {
    totalVisits,
    visitsToday,
    visitsThisWeek,
    visitsThisMonth,
    uniquePaths: uniquePaths.length,
    topPages: topPages.map((page) => ({
      path: page.path,
      count: page._count.path,
    })),
    uniqueUsers: visitsByUser.length,
  };
};


