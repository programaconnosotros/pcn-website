'use server';

import prisma from '@/lib/prisma';

export type EventRegistrationRow = {
  id: string;
  name: string;
  email: string;
  jobTitle: string | null;
  enterprise: string | null;
  career: string | null;
  studyPlace: string | null;
  cancelledAt: Date | null;
  createdAt: Date;
};

export async function getEventRegistrations(eventId: string): Promise<EventRegistrationRow[]> {
  const registrations = await prisma.eventRegistration.findMany({
    where: { eventId },
    include: { user: true },
    orderBy: { createdAt: 'desc' },
  });

  return registrations.map((r) => ({
    id: r.id,
    name: r.user.name,
    email: r.user.email,
    jobTitle: r.user.jobTitle,
    enterprise: r.user.enterprise,
    career: r.user.career,
    studyPlace: r.user.studyPlace,
    cancelledAt: r.cancelledAt,
    createdAt: r.createdAt,
  }));
}
