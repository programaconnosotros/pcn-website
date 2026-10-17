import prisma from '@/lib/prisma';
import { partners } from '@/data/partners';
import { SPONSOR_CLICK_SOURCES, type SponsorClickSource } from '@/lib/sponsor-clicks';

// Cuántos clics recibió cada sponsor, para /admin/sponsors.

export const RECENT_DAYS = 30;

export type SponsorClickRow = {
  name: string;
  /** Null for the site's partners. */
  event: { id: string; name: string } | null;
  total: number;
  recent: number;
  lastClickAt: Date | null;
  bySource: Partial<Record<SponsorClickSource, number>>;
};

type Grouped = {
  name: string;
  eventId: string | null;
  source: string;
  _count: { _all: number };
  _max: { createdAt: Date | null };
};
type GroupedRecent = { name: string; eventId: string | null; _count: { _all: number } };

const keyOf = (name: string, eventId: string | null) => `${eventId ?? ''}\u0000${name}`;

/**
 * One row per sponsor, most clicked first: every site partner (with or without clicks) and every
 * event sponsor that got at least one.
 */
export const summarizeSponsorClicks = (
  grouped: Grouped[],
  recent: GroupedRecent[],
  partnerNames: string[],
  eventNames: Record<string, string>,
): SponsorClickRow[] => {
  const rows = new Map<string, SponsorClickRow>();
  const rowFor = (name: string, eventId: string | null) => {
    const key = keyOf(name, eventId);
    let row = rows.get(key);
    if (!row) {
      row = {
        name,
        event: eventId ? { id: eventId, name: eventNames[eventId] ?? 'evento borrado' } : null,
        total: 0,
        recent: 0,
        lastClickAt: null,
        bySource: {},
      };
      rows.set(key, row);
    }
    return row;
  };

  for (const name of partnerNames) rowFor(name, null);
  for (const group of grouped) {
    const row = rowFor(group.name, group.eventId);
    row.total += group._count._all;
    if (SPONSOR_CLICK_SOURCES.includes(group.source as SponsorClickSource)) {
      const source = group.source as SponsorClickSource;
      row.bySource[source] = (row.bySource[source] ?? 0) + group._count._all;
    }
    const last = group._max.createdAt;
    if (last && (!row.lastClickAt || last > row.lastClickAt)) row.lastClickAt = last;
  }
  for (const group of recent) rowFor(group.name, group.eventId).recent += group._count._all;

  return [...rows.values()].sort(
    (a, b) => b.total - a.total || b.recent - a.recent || a.name.localeCompare(b.name, 'es'),
  );
};

export const getSponsorClickReport = async () => {
  const since = new Date(Date.now() - RECENT_DAYS * 86_400_000);
  const [grouped, recent] = await Promise.all([
    prisma.sponsorClick.groupBy({
      by: ['name', 'eventId', 'source'],
      _count: { _all: true },
      _max: { createdAt: true },
    }),
    prisma.sponsorClick.groupBy({
      by: ['name', 'eventId'],
      where: { createdAt: { gte: since } },
      _count: { _all: true },
    }),
  ]);
  const eventIds = [...new Set(grouped.flatMap((group) => (group.eventId ? [group.eventId] : [])))];
  const events = eventIds.length
    ? await prisma.event.findMany({
        where: { id: { in: eventIds } },
        select: { id: true, name: true },
      })
    : [];

  return summarizeSponsorClicks(
    grouped,
    recent,
    partners.map((partner) => partner.name),
    Object.fromEntries(events.map((event) => [event.id, event.name])),
  );
};
