import prisma from '@/lib/prisma';
import { trackSponsorClick } from '@/actions/sponsors/track-sponsor-click';
import { getSponsorClickReport } from '@/lib/sponsor-clicks-report';
import { actAs } from '@/test/db/fixtures';
import { createTestEvent, createUser, uniqueId } from '@/test/db/content-fixtures';

// Clics en sponsors contra Postgres real: qué se guarda y cómo los suma el reporte de los admins.

describe('sponsor clicks', () => {
  it('counts clicks on partners and event sponsors, and sums them per sponsor', async () => {
    const user = await createUser();
    const event = await createTestEvent();
    const sponsor = `Sponsor ${uniqueId()}`;
    await prisma.sponsor.create({ data: { eventId: event.id, name: sponsor } });
    await actAs(user.id);

    await trackSponsorClick({ name: sponsor, eventId: event.id, source: 'evento' });
    await trackSponsorClick({ name: sponsor, eventId: event.id, source: 'evento' });
    await trackSponsorClick({ name: 'Dizenz', source: 'partners' });
    // A made-up sponsor of a real event doesn't count
    await trackSponsorClick({ name: 'Inventado', eventId: event.id, source: 'evento' });

    const stored = await prisma.sponsorClick.findMany({ where: { eventId: event.id } });
    expect(stored).toHaveLength(2);
    expect(stored[0]).toMatchObject({ name: sponsor, source: 'evento', userId: user.id });

    // Editing the event recreates its sponsors: the clicks stay
    await prisma.sponsor.deleteMany({ where: { eventId: event.id } });
    const report = await getSponsorClickReport();
    const row = report.find((candidate) => candidate.event?.id === event.id);
    expect(row).toMatchObject({ name: sponsor, total: 2, recent: 2, bySource: { evento: 2 } });
    expect(row?.event?.name).toBe(event.name);
    expect(
      report.find((candidate) => candidate.name === 'Dizenz' && !candidate.event)?.total,
    ).toBeGreaterThanOrEqual(1);
  });
});
