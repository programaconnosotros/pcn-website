import { prismaMock } from '@/test/prisma';
import { fetchCommunityStats } from './fetch-community-stats';

describe('fetchCommunityStats', () => {
  it('returns the member, event and talk counts', async () => {
    prismaMock.user.count.mockResolvedValue(120);
    prismaMock.event.count.mockResolvedValue(45);
    prismaMock.talk.count.mockResolvedValue(80);

    const result = await fetchCommunityStats();

    expect(result).toEqual({ members: 120, events: 45, talks: 80 });
  });

  it('only counts events that were not soft-deleted', async () => {
    prismaMock.user.count.mockResolvedValue(0);
    prismaMock.event.count.mockResolvedValue(0);
    prismaMock.talk.count.mockResolvedValue(0);

    await fetchCommunityStats();

    expect(prismaMock.event.count).toHaveBeenCalledWith({ where: { deletedAt: null } });
  });

  it('returns zeros for an empty database', async () => {
    prismaMock.user.count.mockResolvedValue(0);
    prismaMock.event.count.mockResolvedValue(0);
    prismaMock.talk.count.mockResolvedValue(0);

    await expect(fetchCommunityStats()).resolves.toEqual({ members: 0, events: 0, talks: 0 });
  });
});
