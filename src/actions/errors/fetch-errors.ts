'use server';

import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin';

export const fetchErrors = async (page: number = 1, limit: number = 50) => {
  await requireAdmin();

  const skip = (page - 1) * limit;

  const [errors, total] = await Promise.all([
    prisma.errorLog.findMany({
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
        resolver: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),
    prisma.errorLog.count(),
  ]);

  return {
    errors,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getErrorStats = async () => {
  await requireAdmin();

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
