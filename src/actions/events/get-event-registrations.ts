'use server';

import prisma from '@/lib/prisma';
import { requireEventManager } from '@/lib/event-access';
import { activeWaitlistWhere } from '@/lib/event-waitlist';

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
  await requireEventManager(eventId);

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

export type EventWaitlistRow = {
  id: string;
  position: number;
  name: string;
  email: string;
  createdAt: Date;
};

// Quienes esperan un lugar, en el orden en que van a ser promovidos
export async function getEventWaitlist(eventId: string): Promise<EventWaitlistRow[]> {
  await requireEventManager(eventId);

  const entries = await prisma.eventWaitlistEntry.findMany({
    where: activeWaitlistWhere(eventId),
    include: { user: { select: { name: true, email: true } } },
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
  });

  return entries.map((entry, index) => ({
    id: entry.id,
    position: index + 1,
    name: entry.user.name,
    email: entry.user.email,
    createdAt: entry.createdAt,
  }));
}
