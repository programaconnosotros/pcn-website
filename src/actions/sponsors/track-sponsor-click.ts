'use server';

import { cookies } from 'next/headers';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { partners } from '@/data/partners';
import { enforceRateLimit } from '@/lib/rate-limit';
import { findSession } from '@/lib/session';
import { SPONSOR_CLICK_SOURCES } from '@/lib/sponsor-clicks';

const clickSchema = z.object({
  name: z.string().min(1).max(200),
  eventId: z.string().min(1).max(100).nullish(),
  source: z.enum(SPONSOR_CLICK_SOURCES),
});

/**
 * Counts a click on a sponsor's logo. Public, like the page visits: anyone can click one. Only
 * sponsors that exist count (a site partner, or a sponsor of an event that wasn't deleted), so
 * nobody can fill the table with made-up names, and it never throws: the link opens anyway.
 */
export const trackSponsorClick = async (input: z.input<typeof clickSchema>) => {
  const parsed = clickSchema.safeParse(input);
  if (!parsed.success) return;
  const { name, eventId, source } = parsed.data;

  try {
    await enforceRateLimit('sponsorClick');
  } catch {
    return;
  }

  try {
    const exists = eventId
      ? !!(await prisma.sponsor.findFirst({
          where: { eventId, name, event: { deletedAt: null } },
          select: { id: true },
        }))
      : partners.some((partner) => partner.name === name);
    if (!exists) return;

    const sessionId = (await cookies()).get('sessionId')?.value;
    const session = sessionId ? await findSession(sessionId) : null;

    await prisma.sponsorClick.create({
      data: { name, eventId: eventId ?? null, source, userId: session?.userId ?? null },
    });
  } catch (error) {
    console.error('Error tracking sponsor click:', error);
  }
};
