import { prismaMock } from '@/test/prisma';
import { fetchUpcomingEvents } from './fetch-upcoming-events';

const mockUpcomingEvent = {
  id: 'event-1',
  name: 'Tech Talk',
  date: new Date('2026-08-15'),
};

describe('fetchUpcomingEvents', () => {
  it('returns upcoming events from prisma', async () => {
    prismaMock.event.findMany.mockResolvedValue([mockUpcomingEvent] as any);

    const result = await fetchUpcomingEvents();

    expect(result).toEqual([mockUpcomingEvent]);
    expect(prismaMock.event.findMany).toHaveBeenCalledTimes(1);
  });

  it('returns an empty array when there are no upcoming events', async () => {
    prismaMock.event.findMany.mockResolvedValue([]);

    const result = await fetchUpcomingEvents();

    expect(result).toEqual([]);
  });

  it('passes the limit to prisma when provided', async () => {
    prismaMock.event.findMany.mockResolvedValue([]);

    await fetchUpcomingEvents(10);

    expect(prismaMock.event.findMany).toHaveBeenCalledWith(expect.objectContaining({ take: 10 }));
  });

  it('defaults to a limit of 5', async () => {
    prismaMock.event.findMany.mockResolvedValue([]);

    await fetchUpcomingEvents();

    expect(prismaMock.event.findMany).toHaveBeenCalledWith(expect.objectContaining({ take: 5 }));
  });
});
