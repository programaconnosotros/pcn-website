'use server';

import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';

type CapacitySnapshot = {
  capacity: number | null;
  current: number;
  available: boolean;
  waitlistCount: number;
};

const getActiveRegistrationsCount = (tx: Prisma.TransactionClient, eventId: string) =>
  tx.eventRegistration.count({
    where: {
      eventId,
      cancelledAt: null,
    },
  });

const getActiveWaitlistCount = (tx: Prisma.TransactionClient, eventId: string) =>
  tx.eventWaitlistEntry.count({
    where: {
      eventId,
      cancelledAt: null,
      promotedAt: null,
    },
  });

export const getCapacitySnapshot = async (eventId: string): Promise<CapacitySnapshot | null> => {
  return prisma.$transaction(async (tx) => {
    const event = await tx.event.findFirst({
      where: {
        id: eventId,
        deletedAt: null,
      },
      select: {
        capacity: true,
      },
    });

    if (!event) {
      return null;
    }

    const [current, waitlistCount] = await Promise.all([
      getActiveRegistrationsCount(tx, eventId),
      getActiveWaitlistCount(tx, eventId),
    ]);

    return {
      capacity: event.capacity,
      current,
      available: event.capacity === null ? true : current < event.capacity,
      waitlistCount,
    };
  });
};

export const getWaitlistPosition = async (eventId: string, userId: string): Promise<number | null> => {
  const waitlistEntries = await prisma.eventWaitlistEntry.findMany({
    where: {
      eventId,
      cancelledAt: null,
      promotedAt: null,
    },
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    select: {
      userId: true,
    },
  });

  const position = waitlistEntries.findIndex((entry) => entry.userId === userId);
  return position === -1 ? null : position + 1;
};

export const promoteNextFromWaitlist = async (eventId: string) => {
  return prisma.$transaction(
    async (tx) => {
      const event = await tx.event.findFirst({
        where: {
          id: eventId,
          deletedAt: null,
        },
        select: {
          id: true,
          capacity: true,
        },
      });

      if (!event) {
        return null;
      }

      const currentRegistrations = await getActiveRegistrationsCount(tx, eventId);
      if (event.capacity !== null && currentRegistrations >= event.capacity) {
        return null;
      }

      const nextWaitlistEntry = await tx.eventWaitlistEntry.findFirst({
        where: {
          eventId,
          cancelledAt: null,
          promotedAt: null,
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
        orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      });

      if (!nextWaitlistEntry) {
        return null;
      }

      const existingRegistration = await tx.eventRegistration.findFirst({
        where: {
          eventId,
          userId: nextWaitlistEntry.userId,
        },
      });

      let registrationId: string;
      if (existingRegistration && existingRegistration.cancelledAt === null) {
        await tx.eventWaitlistEntry.update({
          where: { id: nextWaitlistEntry.id },
          data: {
            cancelledAt: new Date(),
          },
        });
        return null;
      }

      if (existingRegistration) {
        const reactivated = await tx.eventRegistration.update({
          where: { id: existingRegistration.id },
          data: {
            cancelledAt: null,
          },
          select: {
            id: true,
          },
        });
        registrationId = reactivated.id;
      } else {
        const created = await tx.eventRegistration.create({
          data: {
            eventId,
            userId: nextWaitlistEntry.userId,
          },
          select: {
            id: true,
          },
        });
        registrationId = created.id;
      }

      await tx.eventWaitlistEntry.update({
        where: {
          id: nextWaitlistEntry.id,
        },
        data: {
          promotedAt: new Date(),
        },
      });

      return {
        registrationId,
        userId: nextWaitlistEntry.user.id,
        userName: nextWaitlistEntry.user.name,
        userEmail: nextWaitlistEntry.user.email,
      };
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    },
  );
};
