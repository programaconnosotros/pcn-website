import { prismaMock } from '@/test/prisma';
import { fetchPageVisits, getPageVisitStats } from './fetch-page-visits';

const sampleVisit = {
  id: 'visit-1',
  path: '/home',
  userId: null,
  userAgent: 'Jest/1.0',
  referer: null,
  ipAddress: null,
  createdAt: new Date('2025-06-01'),
  user: null,
};

describe('fetchPageVisits', () => {
  it('uses default limit of 100', async () => {
    prismaMock.pageVisit.findMany.mockResolvedValue([sampleVisit] as any);

    await fetchPageVisits();

    expect(prismaMock.pageVisit.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 100 }),
    );
  });

  it('respects a custom limit', async () => {
    prismaMock.pageVisit.findMany.mockResolvedValue([] as any);

    await fetchPageVisits(25);

    expect(prismaMock.pageVisit.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 25 }),
    );
  });

  it('orders results by createdAt descending', async () => {
    prismaMock.pageVisit.findMany.mockResolvedValue([] as any);

    await fetchPageVisits();

    expect(prismaMock.pageVisit.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { createdAt: 'desc' } }),
    );
  });

  it('includes user relation in the query', async () => {
    prismaMock.pageVisit.findMany.mockResolvedValue([] as any);

    await fetchPageVisits();

    expect(prismaMock.pageVisit.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        include: { user: { select: { id: true, name: true, email: true } } },
      }),
    );
  });

  it('returns the array of page visits', async () => {
    prismaMock.pageVisit.findMany.mockResolvedValue([sampleVisit] as any);

    const result = await fetchPageVisits();

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ id: 'visit-1', path: '/home' });
  });
});

describe('getPageVisitStats', () => {
  it('returns correct stats aggregating all prisma queries', async () => {
    prismaMock.pageVisit.count
      .mockResolvedValueOnce(500) // totalVisits
      .mockResolvedValueOnce(20) // visitsToday
      .mockResolvedValueOnce(80) // visitsThisWeek
      .mockResolvedValueOnce(300); // visitsThisMonth

    prismaMock.pageVisit.groupBy
      .mockResolvedValueOnce([
        { path: '/home', _count: { path: 200 } },
        { path: '/about', _count: { path: 100 } },
        { path: '/events', _count: { path: 50 } },
      ] as any) // uniquePaths
      .mockResolvedValueOnce([
        { path: '/home', _count: { path: 200 } },
        { path: '/about', _count: { path: 100 } },
      ] as any) // topPages
      .mockResolvedValueOnce([
        { userId: 'user-1', _count: { userId: 5 } },
        { userId: 'user-2', _count: { userId: 3 } },
      ] as any); // visitsByUser

    const result = await getPageVisitStats();

    expect(result).toEqual({
      totalVisits: 500,
      visitsToday: 20,
      visitsThisWeek: 80,
      visitsThisMonth: 300,
      uniquePaths: 3,
      topPages: [
        { path: '/home', count: 200 },
        { path: '/about', count: 100 },
      ],
      uniqueUsers: 2,
    });
  });

  it('returns uniquePaths as the length of the paths groupBy result', async () => {
    prismaMock.pageVisit.count
      .mockResolvedValueOnce(10)
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(5)
      .mockResolvedValueOnce(8);

    prismaMock.pageVisit.groupBy
      .mockResolvedValueOnce([
        { path: '/a', _count: { path: 1 } },
        { path: '/b', _count: { path: 2 } },
        { path: '/c', _count: { path: 3 } },
        { path: '/d', _count: { path: 4 } },
      ] as any) // uniquePaths (4 distinct paths)
      .mockResolvedValueOnce([] as any) // topPages
      .mockResolvedValueOnce([] as any); // visitsByUser

    const result = await getPageVisitStats();

    expect(result.uniquePaths).toBe(4);
    expect(result.uniqueUsers).toBe(0);
    expect(result.topPages).toEqual([]);
  });

  it('queries topPages with a limit of 10 ordered by count desc', async () => {
    prismaMock.pageVisit.count
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(0);
    prismaMock.pageVisit.groupBy
      .mockResolvedValueOnce([] as any)
      .mockResolvedValueOnce([] as any)
      .mockResolvedValueOnce([] as any);

    await getPageVisitStats();

    expect(prismaMock.pageVisit.groupBy).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 10,
        orderBy: { _count: { path: 'desc' } },
      }),
    );
  });

  it('excludes null userIds when counting unique users', async () => {
    prismaMock.pageVisit.count
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(0);
    prismaMock.pageVisit.groupBy
      .mockResolvedValueOnce([] as any)
      .mockResolvedValueOnce([] as any)
      .mockResolvedValueOnce([] as any);

    await getPageVisitStats();

    expect(prismaMock.pageVisit.groupBy).toHaveBeenCalledWith(
      expect.objectContaining({
        by: ['userId'],
        where: { userId: { not: null } },
      }),
    );
  });
});
