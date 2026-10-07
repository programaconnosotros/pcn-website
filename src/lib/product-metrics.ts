import { Prisma } from '@/generated/prisma/client';
import { unstable_cache } from 'next/cache';
import prisma from '@/lib/prisma';

// Product metrics for /metricas: traffic, modules, pages, the signup funnel and engagement for
// a date range, each compared with the period of the same length right before it. Everything is
// aggregated in Postgres so the page stays fast as PageVisit grows. Admin visits are never
// tracked (see trackPageVisit), so these numbers are real members and visitors.

import {
  METRICS_TIME_ZONE,
  parseMetricsRange,
  previousRange,
  type MetricsRange,
} from '@/lib/metrics-range';

const DAY = 86_400_000;

type Period = { from: Date; to: Date };

const inPeriod = ({ from, to }: Period) =>
  Prisma.sql`"createdAt" >= ${from} AND "createdAt" < ${to}`;

const toNumber = (value: bigint | number | null) => Number(value ?? 0);

const trafficTotals = async (period: Period) => {
  const [row] = await prisma.$queryRaw<
    { visits: bigint; visitors: bigint; members: bigint }[]
  >`SELECT count(*) AS visits,
           count(DISTINCT coalesce("ipAddress", "userAgent")) AS visitors,
           count(DISTINCT "userId") AS members
      FROM "PageVisit" WHERE ${inPeriod(period)}`;
  return {
    visits: toNumber(row?.visits),
    visitors: toNumber(row?.visitors),
    members: toNumber(row?.members),
  };
};

export type TimePoint = { day: Date; visits: number; visitors: number; signups: number };

/** Visits, visitors and signups per day, or per week when the range is long. */
const timeline = async (period: Period) => {
  const days = (period.to.getTime() - period.from.getTime()) / DAY;
  const unit = days > 120 ? 'week' : 'day';
  const step = unit === 'week' ? Prisma.sql`interval '1 week'` : Prisma.sql`interval '1 day'`;
  const bucket = (column: Prisma.Sql) =>
    Prisma.sql`date_trunc(${unit}, ${column} AT TIME ZONE 'UTC' AT TIME ZONE ${METRICS_TIME_ZONE})`;
  const rows = await prisma.$queryRaw<
    { day: Date; visits: bigint; visitors: bigint; signups: bigint }[]
  >`WITH buckets AS (
        SELECT generate_series(
          ${bucket(Prisma.sql`${period.from}::timestamp`)},
          ${bucket(Prisma.sql`${period.to}::timestamp`)},
          ${step}
        ) AS day
      ),
      visits AS (
        SELECT ${bucket(Prisma.sql`"createdAt"`)} AS day, count(*) AS visits,
               count(DISTINCT coalesce("ipAddress", "userAgent")) AS visitors
          FROM "PageVisit" WHERE ${inPeriod(period)} GROUP BY 1
      ),
      signups AS (
        SELECT ${bucket(Prisma.sql`"createdAt"`)} AS day, count(*) AS signups
          FROM "User" WHERE ${inPeriod(period)} GROUP BY 1
      )
      SELECT b.day, coalesce(v.visits, 0) AS visits, coalesce(v.visitors, 0) AS visitors,
             coalesce(s.signups, 0) AS signups
        FROM buckets b
        LEFT JOIN visits v ON v.day = b.day
        LEFT JOIN signups s ON s.day = b.day
       ORDER BY b.day`;
  return {
    unit,
    points: rows.map((row) => ({
      day: row.day,
      visits: toNumber(row.visits),
      visitors: toNumber(row.visitors),
      signups: toNumber(row.signups),
    })) satisfies TimePoint[],
  };
};

export type PathCount = { path: string; visits: number; visitors: number };

const topPaths = async (period: Period, limit: number) => {
  const rows = await prisma.$queryRaw<{ path: string; visits: bigint; visitors: bigint }[]>`
    SELECT path, count(*) AS visits, count(DISTINCT coalesce("ipAddress", "userAgent")) AS visitors
      FROM "PageVisit" WHERE ${inPeriod(period)}
     GROUP BY path ORDER BY visits DESC LIMIT ${limit}`;
  return rows.map((row) => ({
    path: row.path,
    visits: toNumber(row.visits),
    visitors: toNumber(row.visitors),
  }));
};

/** Visits per first path segment (`/eventos/abc` → `/eventos`), the unit of a "module". */
const sections = async (period: Period) => {
  const rows = await prisma.$queryRaw<
    { section: string; visits: bigint; visitors: bigint; members: bigint }[]
  >`SELECT '/' || split_part(path, '/', 2) AS section, count(*) AS visits,
           count(DISTINCT coalesce("ipAddress", "userAgent")) AS visitors,
           count(DISTINCT "userId") AS members
      FROM "PageVisit" WHERE ${inPeriod(period)}
     GROUP BY 1 ORDER BY visits DESC`;
  return rows.map((row) => ({
    section: row.section,
    visits: toNumber(row.visits),
    visitors: toNumber(row.visitors),
    members: toNumber(row.members),
  }));
};

/** Visits per weekday (0 = Sunday) and hour, in Argentina's time zone. */
const heatmap = async (period: Period) => {
  const rows = await prisma.$queryRaw<{ dow: number; hour: number; visits: bigint }[]>`
    SELECT extract(dow FROM local)::int AS dow, extract(hour FROM local)::int AS hour,
           count(*) AS visits
      FROM (SELECT "createdAt" AT TIME ZONE 'UTC' AT TIME ZONE ${METRICS_TIME_ZONE} AS local
              FROM "PageVisit" WHERE ${inPeriod(period)}) AS v
     GROUP BY 1, 2`;
  const grid = Array.from({ length: 7 }, () => Array<number>(24).fill(0));
  for (const { dow, hour, visits } of rows) grid[dow][hour] = toNumber(visits);
  return grid;
};

/** Where visitors come from: the referer's host, leaving out the site's own pages. */
const referrers = async (period: Period, ownHosts: string[]) => {
  const rows = await prisma.$queryRaw<{ host: string; visits: bigint }[]>`
    SELECT host, count(*) AS visits FROM (
      SELECT lower(substring(referer FROM '^[a-zA-Z]+://(?:www\\.)?([^/:?#]+)')) AS host
        FROM "PageVisit" WHERE ${inPeriod(period)} AND referer IS NOT NULL
    ) AS r
     WHERE host IS NOT NULL AND host <> ALL(${ownHosts})
     GROUP BY host ORDER BY visits DESC LIMIT 8`;
  return rows.map((row) => ({ host: row.host, visits: toNumber(row.visits) }));
};

const devices = async (period: Period) => {
  const [row] = await prisma.$queryRaw<
    { mobile: bigint; tablet: bigint; desktop: bigint; bots: bigint }[]
  >`SELECT
      count(*) FILTER (WHERE ua ~* '(bot|crawl|spider|preview|headless)') AS bots,
      count(*) FILTER (WHERE ua !~* '(bot|crawl|spider|preview|headless)' AND ua ~* '(ipad|tablet)') AS tablet,
      count(*) FILTER (WHERE ua !~* '(bot|crawl|spider|preview|headless|ipad|tablet)' AND ua ~* '(mobi|iphone|android)') AS mobile,
      count(*) FILTER (WHERE ua !~* '(bot|crawl|spider|preview|headless|ipad|tablet|mobi|iphone|android)') AS desktop
    FROM (SELECT coalesce("userAgent", '') AS ua FROM "PageVisit" WHERE ${inPeriod(period)}) AS v`;
  return {
    desktop: toNumber(row?.desktop),
    mobile: toNumber(row?.mobile),
    tablet: toNumber(row?.tablet),
    bots: toNumber(row?.bots),
  };
};

/** Visitors that came back on at least two different days of the period. */
const returningVisitors = async (period: Period) => {
  const [row] = await prisma.$queryRaw<{ returning: bigint }[]>`
    SELECT count(*) AS returning FROM (
      SELECT coalesce("ipAddress", "userAgent")
        FROM "PageVisit" WHERE ${inPeriod(period)}
       GROUP BY 1
      HAVING count(DISTINCT date_trunc('day', "createdAt" AT TIME ZONE 'UTC' AT TIME ZONE ${METRICS_TIME_ZONE})) > 1
    ) AS r`;
  return toNumber(row?.returning);
};

export type FunnelStep = { id: string; label: string; hint: string; count: number };

/**
 * The way from visiting the signup page to taking part, for the people who signed up in the
 * period: opened the form → created the account → verified the email → completed the profile →
 * did something in the community.
 */
const signupFunnel = async (period: Period): Promise<FunnelStep[]> => {
  const createdAt = { gte: period.from, lt: period.to };
  const [[formVisitors], created, verified, profiled, participated] = await Promise.all([
    prisma.$queryRaw<{ visitors: bigint }[]>`
      SELECT count(DISTINCT coalesce("ipAddress", "userAgent")) AS visitors
        FROM "PageVisit" WHERE ${inPeriod(period)} AND path = '/autenticacion/registro'`,
    prisma.user.count({ where: { createdAt } }),
    prisma.user.count({ where: { createdAt, emailVerified: true } }),
    prisma.user.count({
      where: {
        createdAt,
        emailVerified: true,
        OR: [
          { image: { not: null } },
          { slogan: { not: null } },
          { positions: { some: {} } },
          { languages: { some: {} } },
        ],
      },
    }),
    prisma.user.count({
      where: {
        createdAt,
        emailVerified: true,
        OR: [
          { eventRegistrations: { some: {} } },
          { advice: { some: {} } },
          { comments: { some: {} } },
          { likes: { some: {} } },
          { authoredProjects: { some: {} } },
          { contentMarks: { some: {} } },
          { talkProposals: { some: {} } },
        ],
      },
    }),
  ]);
  return [
    {
      id: 'form',
      label: 'abrió el registro',
      hint: 'visitantes únicos de /autenticacion/registro',
      // Someone can sign up from a link without the visit being counted (e.g. blocked tracking).
      count: Math.max(toNumber(formVisitors?.visitors ?? 0), created),
    },
    { id: 'created', label: 'creó la cuenta', hint: 'completó el formulario', count: created },
    { id: 'verified', label: 'verificó el email', hint: 'ingresó el código', count: verified },
    {
      id: 'profile',
      label: 'completó el perfil',
      hint: 'foto, frase, trabajo o lenguajes',
      count: profiled,
    },
    {
      id: 'active',
      label: 'participó',
      hint: 'se anotó a un evento, publicó, comentó, likeó o marcó contenido',
      count: participated,
    },
  ];
};

const engagement = async (period: Period) => {
  const createdAt = { gte: period.from, lt: period.to };
  const [registrations, advice, comments, likes, projects, proposals, articlesRead, videos] =
    await Promise.all([
      prisma.eventRegistration.count({ where: { createdAt, cancelledAt: null } }),
      prisma.advice.count({ where: { createdAt } }),
      prisma.comment.count({ where: { createdAt } }),
      prisma.like.count({ where: { createdAt } }),
      prisma.project.count({ where: { createdAt } }),
      prisma.talkProposal.count({ where: { createdAt } }),
      prisma.contentMark.count({ where: { createdAt, contentType: 'article', mark: 'read' } }),
      prisma.contentMark.count({ where: { createdAt, contentType: 'video', mark: 'watched' } }),
    ]);
  return { registrations, advice, comments, likes, projects, proposals, articlesRead, videos };
};

export type Engagement = Awaited<ReturnType<typeof engagement>>;

export const getProductMetrics = async (range: MetricsRange, ownHosts: string[]) => {
  const previous = previousRange(range);
  const [
    traffic,
    previousTraffic,
    signups,
    previousSignups,
    series,
    modules,
    previousModules,
    pages,
    hours,
    sources,
    deviceSplit,
    returning,
    funnel,
    activity,
    previousActivity,
  ] = await Promise.all([
    trafficTotals(range),
    trafficTotals(previous),
    prisma.user.count({ where: { createdAt: { gte: range.from, lt: range.to } } }),
    prisma.user.count({ where: { createdAt: { gte: previous.from, lt: previous.to } } }),
    timeline(range),
    sections(range),
    sections(previous),
    topPaths(range, 15),
    heatmap(range),
    referrers(range, ownHosts),
    devices(range),
    returningVisitors(range),
    signupFunnel(range),
    engagement(range),
    engagement(previous),
  ]);
  return {
    range,
    previous,
    traffic,
    previousTraffic,
    signups,
    previousSignups,
    series,
    modules,
    previousModules,
    pages,
    hours,
    sources,
    deviceSplit,
    returning,
    funnel,
    activity,
    previousActivity,
  };
};

export type ProductMetrics = Awaited<ReturnType<typeof getProductMetrics>>;

/** How long a computed dashboard is reused. The page is public, so anyone can ask for it. */
export const METRICS_CACHE_SECONDS = 3600;

type RangeParams = { rango?: string; desde?: string; hasta?: string };

// The JSON cache turns Dates into strings; bring them back.
const reviveDates = (metrics: ProductMetrics): ProductMetrics => ({
  ...metrics,
  range: { ...metrics.range, from: new Date(metrics.range.from), to: new Date(metrics.range.to) },
  previous: { from: new Date(metrics.previous.from), to: new Date(metrics.previous.to) },
  series: {
    ...metrics.series,
    points: metrics.series.points.map((point) => ({ ...point, day: new Date(point.day) })),
  },
});

const cachedProductMetrics = unstable_cache(
  (params: RangeParams, ownHosts: string[]) =>
    getProductMetrics(parseMetricsRange(params), ownHosts),
  ['product-metrics'],
  { revalidate: METRICS_CACHE_SECONDS },
);

/**
 * getProductMetrics for the page's query string, computed at most once an hour per range. The
 * cache key is the preset (`30d`) or the custom dates, not the instants they resolve to, so a
 * preset keeps hitting the same entry while `now` moves.
 */
export const getCachedProductMetrics = async (params: RangeParams, ownHosts: string[]) => {
  const { preset } = parseMetricsRange(params);
  const key = preset ? { rango: preset } : { desde: params.desde, hasta: params.hasta };
  return reviveDates(await cachedProductMetrics(key, ownHosts));
};
