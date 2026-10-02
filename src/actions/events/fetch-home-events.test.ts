import { prismaMock } from '@/test/prisma';
import { fetchHomeEvents } from './fetch-home-events';

const event = (id: string) => ({ id, name: id, deletedAt: null, _count: { registrations: 0 } });

describe('fetchHomeEvents', () => {
  it('fills the remaining slots with past events', async () => {
    prismaMock.event.findMany
      .mockResolvedValueOnce([event('next')] as any)
      .mockResolvedValueOnce([event('last'), event('before-last')] as any);

    await expect(fetchHomeEvents()).resolves.toEqual({
      upcoming: [event('next')],
      past: [event('last'), event('before-last')],
    });
    expect(prismaMock.event.findMany).toHaveBeenLastCalledWith(
      expect.objectContaining({
        take: 2,
        orderBy: { date: 'desc' },
        where: expect.objectContaining({ id: { notIn: ['next'] } }),
      }),
    );
  });

  it('skips past events when upcoming ones fill every slot', async () => {
    prismaMock.event.findMany.mockResolvedValueOnce([event('a'), event('b'), event('c')] as any);

    const { past } = await fetchHomeEvents();

    expect(past).toEqual([]);
    expect(prismaMock.event.findMany).toHaveBeenCalledTimes(1);
  });

  it('asks for the soonest upcoming events first', async () => {
    prismaMock.event.findMany.mockResolvedValue([]);

    await fetchHomeEvents();

    expect(prismaMock.event.findMany).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ orderBy: { date: 'asc' }, take: 3 }),
    );
  });
});
