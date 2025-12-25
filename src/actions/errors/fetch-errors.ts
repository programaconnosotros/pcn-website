'use server';

import prisma from '@/lib/prisma';

export const fetchErrors = async (limit: number = 100) => {
  return prisma.errorLog.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      resolver: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
};

export const getErrorStats = async () => {
  const [totalErrors, unresolvedErrors, errorsToday, errorsThisWeek] = await Promise.all([
    prisma.errorLog.count(),
    prisma.errorLog.count({
      where: {
        resolved: false,
      },
    }),
    prisma.errorLog.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
    prisma.errorLog.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    }),
  ]);

  return {
    totalErrors,
    unresolvedErrors,
    errorsToday,
    errorsThisWeek,
  };
};
