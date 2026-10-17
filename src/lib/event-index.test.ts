import { prismaMock } from '@/test/prisma';
import { getEventCounts, getEventNames, listEventIndex } from './event-index';

const events = [
  { id: 'e1', name: 'Meetup', date: new Date('2025-01-01T20:00:00Z'), endDate: null },
  { id: 'e2', name: 'Cowork', date: new Date('2025-02-01T20:00:00Z'), endDate: null },
];

describe('listEventIndex', () => {
  it('lists events that were not deleted, soonest first, keeping Dates', async () => {
    prismaMock.event.findMany.mockResolvedValue(events as any);

    const result = await listEventIndex();

    expect(result).toEqual(events);
    expect(result[0].date).toBeInstanceOf(Date);
    expect(prismaMock.event.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { deletedAt: null }, orderBy: { date: 'asc' } }),
    );
  });
});

describe('getEventNames', () => {
  it('maps the requested ids that exist to their names', async () => {
    prismaMock.event.findMany.mockResolvedValue(events as any);
    await expect(getEventNames(['e2', 'missing'])).resolves.toEqual({ e2: 'Cowork' });
  });

  it('is empty for no ids', async () => {
    prismaMock.event.findMany.mockResolvedValue(events as any);
    await expect(getEventNames([])).resolves.toEqual({});
  });
});

describe('getEventCounts', () => {
  it('counts active and total registrations, the waitlist and the catalog number', async () => {
    const date = new Date('2025-02-01T20:00:00Z');
    prismaMock.event.findFirst.mockResolvedValue({ date } as any);
    (prismaMock.eventRegistration.groupBy as unknown as jest.Mock).mockResolvedValue([
      { cancelledAt: null, _count: 3 },
      { cancelledAt: new Date('2025-01-20T00:00:00Z'), _count: 1 },
      { cancelledAt: new Date('2025-01-21T00:00:00Z'), _count: 2 },
    ] as any);
    prismaMock.eventWaitlistEntry.count.mockResolvedValue(4);
    prismaMock.event.count.mockResolvedValue(7);

    await expect(getEventCounts('e2')).resolves.toEqual({
      activeRegistrations: 3,
      totalRegistrations: 6,
      waitlist: 4,
      catalogNumber: 7,
    });
    expect(prismaMock.event.count).toHaveBeenCalledWith({
      where: { deletedAt: null, date: { lte: date } },
    });
    expect(prismaMock.eventWaitlistEntry.count).toHaveBeenCalledWith({
      where: { eventId: 'e2', cancelledAt: null, promotedAt: null },
    });
  });

  it('has no catalog number for a missing or deleted event', async () => {
    prismaMock.event.findFirst.mockResolvedValue(null);
    (prismaMock.eventRegistration.groupBy as unknown as jest.Mock).mockResolvedValue([] as any);
    prismaMock.eventWaitlistEntry.count.mockResolvedValue(0);

    await expect(getEventCounts('gone')).resolves.toEqual({
      activeRegistrations: 0,
      totalRegistrations: 0,
      waitlist: 0,
      catalogNumber: 0,
    });
    expect(prismaMock.event.count).not.toHaveBeenCalled();
  });
});
