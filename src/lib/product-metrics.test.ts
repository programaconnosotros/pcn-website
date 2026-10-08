import { Prisma } from '@/generated/prisma/client';
import { unstable_cache } from 'next/cache';
import { prismaMock } from '@/test/prisma';
import { getCachedProductMetrics, getProductMetrics } from './product-metrics';

// Like the real data cache: what comes back went through JSON, so Dates are strings.
jest.mock('next/cache', () => ({
  revalidateTag: jest.fn(),
  unstable_cache: jest.fn(
    (fn: (..._args: unknown[]) => Promise<unknown>) =>
      async (...args: unknown[]) =>
        JSON.parse(JSON.stringify(await fn(...args))),
  ),
}));

// Captured at import, before clearMocks wipes the calls.
const [cacheCall] = jest.mocked(unstable_cache).mock.calls;

const DAY = 86_400_000;
const range = {
  from: new Date('2026-09-01T03:00:00Z'),
  to: new Date('2026-09-11T03:00:00Z'),
  preset: null,
};

type Query = { sql: string; values: unknown[] };
let queries: Query[];

/** Answers each raw query by what it selects; `current` rows for the range, `previous` for the period before it. */
const mockRawQueries = (overrides: Partial<Record<string, unknown[]>> = {}) => {
  prismaMock.$queryRaw.mockImplementation(((
    strings: TemplateStringsArray,
    ...values: unknown[]
  ) => {
    const query = Prisma.sql(strings, ...(values as Prisma.Sql[]));
    queries.push({ sql: query.sql, values: query.values });
    const isPrevious = query.values.some(
      (value) => value instanceof Date && value.getTime() < range.from.getTime(),
    );
    const pick = (key: string, fallback: unknown[]) => Promise.resolve(overrides[key] ?? fallback);
    const sql = query.sql;
    if (sql.includes('generate_series'))
      return pick('timeline', [
        {
          day: new Date('2026-09-01T00:00:00Z'),
          visits: BigInt(5),
          visitors: BigInt(3),
          signups: BigInt(1),
        },
        {
          day: new Date('2026-09-02T00:00:00Z'),
          visits: BigInt(0),
          visitors: BigInt(0),
          signups: BigInt(0),
        },
      ]);
    if (sql.includes('row_number()'))
      return pick('modulePages', [
        { section: '/eventos', path: '/eventos/abc', visits: BigInt(6) },
        { section: '/eventos', path: '/eventos', visits: BigInt(4) },
      ]);
    if (sql.includes('module_returning'))
      return pick('moduleReturning', [{ section: '/eventos', visitors: BigInt(2) }]);
    if (sql.includes('split_part'))
      return pick('sections', [
        {
          section: '/eventos',
          visits: isPrevious ? BigInt(2) : BigInt(10),
          visitors: BigInt(4),
          members: BigInt(1),
          memberVisits: BigInt(3),
        },
      ]);
    if (sql.includes('extract(dow'))
      return pick('heatmap', [
        { dow: 1, hour: 20, visits: BigInt(7) },
        { dow: 0, hour: 0, visits: BigInt(1) },
      ]);
    if (sql.includes('referer'))
      return pick('referrers', [{ host: 'google.com', visits: BigInt(3) }]);
    if (sql.includes('FILTER'))
      return pick('devices', [
        { mobile: BigInt(4), tablet: BigInt(1), desktop: BigInt(6), bots: BigInt(2) },
      ]);
    if (sql.includes('AS returning')) return pick('returning', [{ returning: BigInt(2) }]);
    if (sql.includes('/autenticacion/registro')) return pick('form', [{ visitors: BigInt(9) }]);
    if (sql.includes('GROUP BY path'))
      return pick('paths', [{ path: '/eventos/abc', visits: BigInt(8), visitors: BigInt(5) }]);
    return pick('traffic', [
      isPrevious
        ? { visits: BigInt(50), visitors: BigInt(20), members: BigInt(3) }
        : { visits: BigInt(100), visitors: BigInt(40), members: BigInt(6) },
    ]);
  }) as never);
};

beforeEach(() => {
  queries = [];
  prismaMock.user.count.mockImplementation((({ where }: { where: Record<string, unknown> }) => {
    if ('OR' in where) {
      const or = where.OR as Record<string, unknown>[];
      return Promise.resolve('image' in or[0] ? 3 : 2);
    }
    if (where.emailVerified) return Promise.resolve(4);
    const { gte } = where.createdAt as { gte: Date };
    return Promise.resolve(gte < range.from ? 1 : 5);
  }) as never);
  prismaMock.eventRegistration.count.mockResolvedValue(11);
  prismaMock.advice.count.mockResolvedValue(12);
  prismaMock.comment.count.mockResolvedValue(13);
  prismaMock.like.count.mockResolvedValue(14);
  prismaMock.project.count.mockResolvedValue(15);
  prismaMock.talkProposal.count.mockResolvedValue(16);
  prismaMock.contentMark.count.mockImplementation((({ where }: { where: { mark: string } }) =>
    Promise.resolve(where.mark === 'read' ? 17 : where.mark === 'saved' ? 19 : 18)) as never);
  prismaMock.forumPost.count.mockResolvedValue(21);
  prismaMock.forumComment.count.mockResolvedValue(22);
  prismaMock.forumPostLike.count.mockResolvedValue(23);
  prismaMock.galleryItem.count.mockResolvedValue(24);
  prismaMock.galleryItemTag.count.mockResolvedValue(25);
  prismaMock.setup.count.mockResolvedValue(26);
  prismaMock.setupLike.count.mockResolvedValue(27);
});

describe('getProductMetrics', () => {
  it('aggregates every section for the range and the period before it', async () => {
    mockRawQueries();
    const metrics = await getProductMetrics(range, ['programaconnosotros.com']);

    expect(metrics.range).toBe(range);
    expect(metrics.previous).toEqual({
      from: new Date(range.from.getTime() - 10 * DAY),
      to: range.from,
    });
    expect(metrics.traffic).toEqual({ visits: 100, visitors: 40, members: 6 });
    expect(metrics.previousTraffic).toEqual({ visits: 50, visitors: 20, members: 3 });
    expect(metrics.signups).toBe(5);
    expect(metrics.previousSignups).toBe(1);
    expect(metrics.series.unit).toBe('day');
    expect(metrics.series.points).toEqual([
      { day: new Date('2026-09-01T00:00:00Z'), visits: 5, visitors: 3, signups: 1 },
      { day: new Date('2026-09-02T00:00:00Z'), visits: 0, visitors: 0, signups: 0 },
    ]);
    expect(metrics.includeAdmins).toBe(false);
    expect(metrics.modules).toEqual([
      { section: '/eventos', visits: 10, visitors: 4, members: 1, memberVisits: 3 },
    ]);
    expect(metrics.pagesByModule).toEqual([
      { section: '/eventos', path: '/eventos/abc', visits: 6 },
      { section: '/eventos', path: '/eventos', visits: 4 },
    ]);
    expect(metrics.returningByModule).toEqual({ '/eventos': 2 });
    const counts = (section: string) =>
      metrics.usage[section].map(({ key, count }) => [key, count]);
    expect(counts('/eventos')).toEqual([
      ['registrations', 11],
      ['proposals', 16],
    ]);
    expect(counts('/foro')).toEqual([
      ['forumPosts', 21],
      ['forumComments', 22],
      ['forumLikes', 23],
    ]);
    expect(counts('/galeria')).toEqual([
      ['galleryUploads', 24],
      ['galleryTags', 25],
    ]);
    expect(counts('/setups')).toEqual([
      ['setups', 26],
      ['setupLikes', 27],
    ]);
    expect(counts('/lectura')).toEqual([
      ['articlesRead', 17],
      ['articlesSaved', 19],
    ]);
    expect(metrics.previousUsage).toEqual(metrics.usage);
    expect(metrics.previousModules[0].visits).toBe(2);
    expect(metrics.pages).toEqual([{ path: '/eventos/abc', visits: 8, visitors: 5 }]);
    expect(metrics.hours).toHaveLength(7);
    expect(metrics.hours[1][20]).toBe(7);
    expect(metrics.hours[0][0]).toBe(1);
    expect(metrics.hours[3].every((count) => count === 0)).toBe(true);
    expect(metrics.sources).toEqual([{ host: 'google.com', visits: 3 }]);
    expect(metrics.deviceSplit).toEqual({ desktop: 6, mobile: 4, tablet: 1, bots: 2 });
    expect(metrics.returning).toBe(2);
    expect(metrics.funnel.map(({ id, count }) => [id, count])).toEqual([
      ['form', 9],
      ['created', 5],
      ['verified', 4],
      ['profile', 3],
      ['active', 2],
    ]);
    expect(metrics.activity).toEqual({
      registrations: 11,
      advice: 12,
      comments: 13,
      likes: 14,
      projects: 15,
      proposals: 16,
      articlesRead: 17,
      videos: 18,
    });
    expect(metrics.previousActivity).toEqual(metrics.activity);
  });

  it("leaves the site's own hosts out of the referrers", async () => {
    mockRawQueries();
    await getProductMetrics(range, ['programaconnosotros.com', 'localhost']);
    const referrers = queries.find(({ sql }) => sql.includes('referer'));
    expect(referrers?.values).toContainEqual(['programaconnosotros.com', 'localhost']);
  });

  it('only counts registrations that were not cancelled', async () => {
    mockRawQueries();
    await getProductMetrics(range, []);
    expect(prismaMock.eventRegistration.count).toHaveBeenCalledWith({
      where: {
        createdAt: { gte: range.from, lt: range.to },
        cancelledAt: null,
        NOT: { user: { role: 'ADMIN' } },
      },
    });
  });

  it("leaves admins' visits, signups and actions out by default", async () => {
    mockRawQueries();
    await getProductMetrics(range, []);
    const visitQueries = queries.filter(({ sql }) => sql.includes('"PageVisit"'));
    expect(visitQueries.length).toBeGreaterThan(0);
    for (const { sql } of visitQueries) expect(sql).toContain("visitor.role = 'ADMIN'");
    expect(queries.find(({ sql }) => sql.includes('generate_series'))?.sql).toContain(
      "role <> 'ADMIN'",
    );
    expect(prismaMock.user.count).toHaveBeenCalledWith({
      where: { createdAt: { gte: range.from, lt: range.to }, role: { not: 'ADMIN' } },
    });
    expect(prismaMock.advice.count).toHaveBeenCalledWith({
      where: { createdAt: { gte: range.from, lt: range.to }, NOT: { author: { role: 'ADMIN' } } },
    });
    expect(prismaMock.galleryItem.count).toHaveBeenCalledWith({
      where: {
        createdAt: { gte: range.from, lt: range.to },
        legacyId: null,
        NOT: { uploadedBy: { role: 'ADMIN' } },
      },
    });
  });

  it('counts admins too when asked', async () => {
    mockRawQueries();
    const metrics = await getProductMetrics(range, [], { includeAdmins: true });
    expect(metrics.includeAdmins).toBe(true);
    for (const { sql } of queries) {
      expect(sql).not.toContain("visitor.role = 'ADMIN'");
      expect(sql).not.toContain("role <> 'ADMIN'");
    }
    expect(prismaMock.user.count).toHaveBeenCalledWith({
      where: { createdAt: { gte: range.from, lt: range.to } },
    });
    expect(prismaMock.advice.count).toHaveBeenCalledWith({
      where: { createdAt: { gte: range.from, lt: range.to } },
    });
  });

  it('groups the timeline by week when the range is longer than 120 days', async () => {
    mockRawQueries();
    const long = {
      from: new Date(range.to.getTime() - 365 * DAY),
      to: range.to,
      preset: '12m' as const,
    };
    const metrics = await getProductMetrics(long, []);
    expect(metrics.series.unit).toBe('week');
    const timeline = queries.find(({ sql }) => sql.includes('generate_series'));
    expect(timeline?.values).toContain('week');
    expect(timeline?.sql).toContain("interval '1 week'");
  });

  it('turns missing rows and null counts into zeros', async () => {
    mockRawQueries({
      traffic: [],
      devices: [],
      returning: [],
      form: [{ visitors: null }],
      timeline: [
        { day: new Date('2026-09-01T00:00:00Z'), visits: null, visitors: null, signups: null },
      ],
    });
    const metrics = await getProductMetrics(range, []);
    expect(metrics.traffic).toEqual({ visits: 0, visitors: 0, members: 0 });
    expect(metrics.deviceSplit).toEqual({ desktop: 0, mobile: 0, tablet: 0, bots: 0 });
    expect(metrics.returning).toBe(0);
    expect(metrics.series.points[0]).toMatchObject({ visits: 0, visitors: 0, signups: 0 });
    // Nobody visited the form, but 5 signed up: the first step never shows fewer than the second.
    expect(metrics.funnel[0].count).toBe(5);
  });

  it('starts the funnel at the accounts created when the form visit query returns nothing', async () => {
    mockRawQueries({ form: [] });
    const metrics = await getProductMetrics(range, []);
    expect(metrics.funnel[0].count).toBe(5);
  });

  it('propagates database errors', async () => {
    prismaMock.$queryRaw.mockRejectedValue(new Error('db down'));
    await expect(getProductMetrics(range, [])).rejects.toThrow('db down');
  });
});

describe('getCachedProductMetrics', () => {
  beforeEach(() => mockRawQueries());

  it('brings the cached Dates back as Dates', async () => {
    const metrics = await getCachedProductMetrics({ rango: '7d' }, []);
    expect(metrics.range.from).toBeInstanceOf(Date);
    expect(metrics.range.to).toBeInstanceOf(Date);
    expect(metrics.range.preset).toBe('7d');
    expect(metrics.previous.from).toBeInstanceOf(Date);
    expect(metrics.previous.to).toBeInstanceOf(Date);
    expect(metrics.series.points[0].day).toBeInstanceOf(Date);
    expect(metrics.range.to.getTime() - metrics.range.from.getTime()).toBe(7 * DAY);
  });

  it('keys a custom range by its dates', async () => {
    const metrics = await getCachedProductMetrics({ desde: '2026-01-01', hasta: '2026-01-10' }, []);
    expect(metrics.range.preset).toBeNull();
    expect(metrics.range.from.toISOString()).toBe('2026-01-01T03:00:00.000Z');
    expect(metrics.range.to.toISOString()).toBe('2026-01-11T03:00:00.000Z');
  });

  it('keys the admin filter apart from the default view', async () => {
    const withAdmins = await getCachedProductMetrics({ rango: '7d', admins: '1' }, []);
    expect(withAdmins.includeAdmins).toBe(true);
    const without = await getCachedProductMetrics({ rango: '7d', admins: 'no' }, []);
    expect(without.includeAdmins).toBe(false);
  });

  it('caches for an hour under a fixed key', () => {
    expect(cacheCall).toEqual([expect.any(Function), ['product-metrics'], { revalidate: 3600 }]);
  });
});
