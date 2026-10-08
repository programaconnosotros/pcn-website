import { headers } from 'next/headers';
import prisma from '@/lib/prisma';
import { enforceRateLimit } from '@/lib/rate-limit';
import { trackPageVisit } from '@/actions/analytics/track-page-visit';
import { fetchPageVisits, getPageVisitStats } from '@/actions/analytics/fetch-page-visits';
import { actAs } from '@/test/db/fixtures';
import { createAdmin, createUser, daysFromNow, uniqueId } from '@/test/db/content-fixtures';

// Registro de visitas y su panel de admins contra Postgres real.

const visitsTo = (path: string) => prisma.pageVisit.findMany({ where: { path } });

describe('trackPageVisit', () => {
  it('stores an anonymous visit with the request data', async () => {
    const path = `/eventos/${uniqueId()}`;
    await actAs();
    (headers as jest.Mock).mockResolvedValue(
      new Headers({
        'user-agent': 'Mozilla/5.0 (iPhone)',
        referer: 'https://google.com/',
        'x-forwarded-for': '198.51.100.1, 203.0.113.9',
      }),
    );

    await trackPageVisit(path);

    const [visit] = await visitsTo(path);
    expect(visit).toMatchObject({
      userId: null,
      userAgent: 'Mozilla/5.0 (iPhone)',
      referer: 'https://google.com/',
      // La última IP de x-forwarded-for, la que agrega el proxy
      ipAddress: '203.0.113.9',
    });
  });

  it('links the visit to whoever is logged in, admins included, but the panel leaves admins out', async () => {
    const [user, admin] = [await createUser(), await createAdmin()];
    const path = `/perfil/${uniqueId()}`;

    await actAs(user.id);
    await trackPageVisit(path);
    await actAs(admin.id);
    await trackPageVisit(path);

    expect((await visitsTo(path)).map((v) => v.userId).sort()).toEqual([user.id, admin.id].sort());
    const listed = (await fetchPageVisits(1000)).filter((visit) => visit.path === path);
    expect(listed.map((visit) => visit.userId)).toEqual([user.id]);
  });

  it('ignores paths that are not routes and clips long ones', async () => {
    await actAs();
    const marker = uniqueId();
    await trackPageVisit(`https://evil.test/${marker}`);
    await trackPageVisit(undefined as unknown as string);
    expect(await prisma.pageVisit.count({ where: { path: { contains: marker } } })).toBe(0);

    const long = `/${marker}${'a'.repeat(2000)}`;
    await trackPageVisit(long);
    const [visit] = await prisma.pageVisit.findMany({
      where: { path: { startsWith: `/${marker}` } },
    });
    expect(visit.path).toHaveLength(500);
  });

  it('drops the visit silently when rate limited', async () => {
    await actAs();
    const path = `/limitado/${uniqueId()}`;
    (enforceRateLimit as jest.Mock).mockRejectedValueOnce(new Error('Demasiados pedidos'));

    await expect(trackPageVisit(path)).resolves.toBeUndefined();
    expect(await visitsTo(path)).toHaveLength(0);
  });
});

describe('fetchPageVisits and getPageVisitStats', () => {
  it('lists the latest visits with their member, only for admins', async () => {
    const [admin, user] = [await createAdmin(), await createUser()];
    const path = `/ultima/${uniqueId()}`;
    await prisma.pageVisit.create({ data: { path, userId: user.id, createdAt: daysFromNow(365) } });

    await actAs(admin.id);
    const [latest] = await fetchPageVisits(1);
    expect(latest).toMatchObject({
      path,
      user: { id: user.id, name: user.name, email: user.email },
    });

    for (const userId of [user.id, undefined]) {
      await actAs(userId);
      await expect(fetchPageVisits()).rejects.toThrow('No autorizado');
      await expect(getPageVisitStats()).rejects.toThrow('No autorizado');
    }
  });

  it('counts visits per period, unique paths and members', async () => {
    const [admin, a, b] = [await createAdmin(), await createUser(), await createUser()];
    await actAs(admin.id);
    const before = await getPageVisitStats();

    const hot = `/popular/${uniqueId()}`;
    await prisma.pageVisit.createMany({
      data: [
        ...Array.from({ length: 1000 }, () => ({ path: hot })),
        { path: hot, userId: a.id },
        { path: `/otra/${uniqueId()}`, userId: b.id, createdAt: daysFromNow(-3) },
        { path: `/vieja/${uniqueId()}`, userId: a.id, createdAt: daysFromNow(-20) },
      ],
    });

    const after = await getPageVisitStats();
    expect(after.totalVisits - before.totalVisits).toBe(1003);
    expect(after.visitsToday - before.visitsToday).toBe(1001);
    expect(after.visitsThisWeek - before.visitsThisWeek).toBe(1002);
    expect(after.visitsThisMonth - before.visitsThisMonth).toBe(1003);
    expect(after.uniquePaths - before.uniquePaths).toBe(3);
    expect(after.uniqueUsers - before.uniqueUsers).toBe(2);
    expect(after.topPages[0]).toEqual({ path: hot, count: 1001 });
  });
});
