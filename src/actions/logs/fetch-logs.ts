'use server';

import prisma from '@/lib/prisma';

export const fetchLogs = async (page: number = 1, limit: number = 50, level?: string) => {
  const skip = (page - 1) * limit;
  const where = level ? { level } : {};

  const [logs, total] = await Promise.all([
    prisma.appLog.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),
    prisma.appLog.count({ where }),
  ]);

  return {
    logs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getLogStats = async () => {
  const [totalLogs, logsToday, logsThisWeek, logsByLevel] = await Promise.all([
    prisma.appLog.count(),
    prisma.appLog.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
    prisma.appLog.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    }),
    prisma.appLog.groupBy({
      by: ['level'],
      _count: {
        level: true,
      },
    }),
  ]);

  const logsByLevelMap = logsByLevel.reduce(
    (acc, item) => {
      acc[item.level] = item._count.level;
      return acc;
    },
    {} as Record<string, number>,
  );

  return {
    totalLogs,
    logsToday,
    logsThisWeek,
    logsByLevel: {
      info: logsByLevelMap['info'] || 0,
      warn: logsByLevelMap['warn'] || 0,
      error: logsByLevelMap['error'] || 0,
      debug: logsByLevelMap['debug'] || 0,
    },
  };
};
