import { Prisma } from '@/generated/prisma/client';
import { unstable_cache } from 'next/cache';
import prisma from '@/lib/prisma';
import { nonAdminVisitSql } from '@/lib/page-visit-filters';

// Product metrics for /metricas: traffic, modules, pages, the signup funnel and engagement for
// a date range, each compared with the period of the same length right before it. Everything is
// aggregated in Postgres so the page stays fast as PageVisit grows. Admins (mostly the people
// building the site) are left out unless `includeAdmins`: their visits and what they post.

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

/** The PageVisit rows of a period, as a WHERE clause; admin visits only when asked. */
type VisitWhere = (_period: Period) => Prisma.Sql;

const visitsWhere =
  (includeAdmins: boolean): VisitWhere =>
  (period) =>
    includeAdmins ? inPeriod(period) : Prisma.sql`${inPeriod(period)} AND ${nonAdminVisitSql}`;

const trafficTotals = async (period: Period, where: VisitWhere) => {
  const [row] = await prisma.$queryRaw<
    { visits: bigint; visitors: bigint; members: bigint }[]
  >`SELECT count(*) AS visits,
           count(DISTINCT coalesce("ipAddress", "userAgent")) AS visitors,
           count(DISTINCT "userId") AS members
      FROM "PageVisit" WHERE ${where(period)}`;
  return {
    visits: toNumber(row?.visits),
    visitors: toNumber(row?.visitors),
    members: toNumber(row?.members),
  };
};

export type TimePoint = { day: Date; visits: number; visitors: number; signups: number };

/** Visits, visitors and signups per day, or per week when the range is long. */
const timeline = async (period: Period, where: VisitWhere, signupsWhere: Prisma.Sql) => {
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
          FROM "PageVisit" WHERE ${where(period)} GROUP BY 1
      ),
      signups AS (
        SELECT ${bucket(Prisma.sql`"createdAt"`)} AS day, count(*) AS signups
          FROM "User" WHERE ${inPeriod(period)} ${signupsWhere} GROUP BY 1
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

const topPaths = async (period: Period, where: VisitWhere, limit: number) => {
  const rows = await prisma.$queryRaw<{ path: string; visits: bigint; visitors: bigint }[]>`
    SELECT path, count(*) AS visits, count(DISTINCT coalesce("ipAddress", "userAgent")) AS visitors
      FROM "PageVisit" WHERE ${where(period)}
     GROUP BY path ORDER BY visits DESC LIMIT ${limit}`;
  return rows.map((row) => ({
    path: row.path,
    visits: toNumber(row.visits),
    visitors: toNumber(row.visitors),
  }));
};

/** A path's module: its first segment (`/eventos/abc` → `/eventos`). */
const SECTION = Prisma.sql`'/' || split_part(path, '/', 2)`;

/** Visits per module, with how many visitors were logged in and how many visits they made. */
const sections = async (period: Period, where: VisitWhere) => {
  const rows = await prisma.$queryRaw<
    { section: string; visits: bigint; visitors: bigint; members: bigint; memberVisits: bigint }[]
  >`SELECT ${SECTION} AS section, count(*) AS visits,
           count(DISTINCT coalesce("ipAddress", "userAgent")) AS visitors,
           count(DISTINCT "userId") AS members,
           count("userId") AS "memberVisits"
      FROM "PageVisit" WHERE ${where(period)}
     GROUP BY 1 ORDER BY visits DESC`;
  return rows.map((row) => ({
    section: row.section,
    visits: toNumber(row.visits),
    visitors: toNumber(row.visitors),
    members: toNumber(row.members),
    memberVisits: toNumber(row.memberVisits),
  }));
};

export type ModuleTraffic = Awaited<ReturnType<typeof sections>>[number];

export type ModulePage = { section: string; path: string; visits: number };

/** The three most visited pages inside each module. */
const modulePages = async (period: Period, where: VisitWhere): Promise<ModulePage[]> => {
  const rows = await prisma.$queryRaw<{ section: string; path: string; visits: bigint }[]>`
    SELECT section, path, visits FROM (
      SELECT ${SECTION} AS section, path, count(*) AS visits,
             row_number() OVER (PARTITION BY ${SECTION} ORDER BY count(*) DESC, path) AS rank
        FROM "PageVisit" WHERE ${where(period)}
       GROUP BY path
    ) AS ranked
     WHERE rank <= 3
     ORDER BY section, visits DESC`;
  return rows.map((row) => ({
    section: row.section,
    path: row.path,
    visits: toNumber(row.visits),
  }));
};

/** Per module, the visitors that came back to it on at least two different days. */
const moduleReturning = async (period: Period, where: VisitWhere) => {
  const rows = await prisma.$queryRaw<{ section: string; visitors: bigint }[]>`
    SELECT section, count(*) AS visitors FROM (
      SELECT ${SECTION} AS section, coalesce("ipAddress", "userAgent") AS visitor
        FROM "PageVisit" WHERE ${where(period)}
       GROUP BY 1, 2
      HAVING count(DISTINCT date_trunc('day', "createdAt" AT TIME ZONE 'UTC' AT TIME ZONE ${METRICS_TIME_ZONE})) > 1
    ) AS module_returning
     GROUP BY section`;
  return Object.fromEntries(rows.map((row) => [row.section, toNumber(row.visitors)])) as Record<
    string,
    number
  >;
};

/** Visits per weekday (0 = Sunday) and hour, in Argentina's time zone. */
const heatmap = async (period: Period, where: VisitWhere) => {
  const rows = await prisma.$queryRaw<{ dow: number; hour: number; visits: bigint }[]>`
    SELECT extract(dow FROM local)::int AS dow, extract(hour FROM local)::int AS hour,
           count(*) AS visits
      FROM (SELECT "createdAt" AT TIME ZONE 'UTC' AT TIME ZONE ${METRICS_TIME_ZONE} AS local
              FROM "PageVisit" WHERE ${where(period)}) AS v
     GROUP BY 1, 2`;
  const grid = Array.from({ length: 7 }, () => Array<number>(24).fill(0));
  for (const { dow, hour, visits } of rows) grid[dow][hour] = toNumber(visits);
  return grid;
};

/** Where visitors come from: the referer's host, leaving out the site's own pages. */
const referrers = async (period: Period, where: VisitWhere, ownHosts: string[]) => {
  const rows = await prisma.$queryRaw<{ host: string; visits: bigint }[]>`
    SELECT host, count(*) AS visits FROM (
      SELECT lower(substring(referer FROM '^[a-zA-Z]+://(?:www\\.)?([^/:?#]+)')) AS host
        FROM "PageVisit" WHERE ${where(period)} AND referer IS NOT NULL
    ) AS r
     WHERE host IS NOT NULL AND host <> ALL(${ownHosts})
     GROUP BY host ORDER BY visits DESC LIMIT 8`;
  return rows.map((row) => ({ host: row.host, visits: toNumber(row.visits) }));
};

const devices = async (period: Period, where: VisitWhere) => {
  const [row] = await prisma.$queryRaw<
    { mobile: bigint; tablet: bigint; desktop: bigint; bots: bigint }[]
  >`SELECT
      count(*) FILTER (WHERE ua ~* '(bot|crawl|spider|preview|headless)') AS bots,
      count(*) FILTER (WHERE ua !~* '(bot|crawl|spider|preview|headless)' AND ua ~* '(ipad|tablet)') AS tablet,
      count(*) FILTER (WHERE ua !~* '(bot|crawl|spider|preview|headless|ipad|tablet)' AND ua ~* '(mobi|iphone|android)') AS mobile,
      count(*) FILTER (WHERE ua !~* '(bot|crawl|spider|preview|headless|ipad|tablet|mobi|iphone|android)') AS desktop
    FROM (SELECT coalesce("userAgent", '') AS ua FROM "PageVisit" WHERE ${where(period)}) AS v`;
  return {
    desktop: toNumber(row?.desktop),
    mobile: toNumber(row?.mobile),
    tablet: toNumber(row?.tablet),
    bots: toNumber(row?.bots),
  };
};

/** Visitors that came back on at least two different days of the period. */
const returningVisitors = async (period: Period, where: VisitWhere) => {
  const [row] = await prisma.$queryRaw<{ returning: bigint }[]>`
    SELECT count(*) AS returning FROM (
      SELECT coalesce("ipAddress", "userAgent")
        FROM "PageVisit" WHERE ${where(period)}
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
const signupFunnel = async (
  period: Period,
  where: VisitWhere,
  includeAdmins: boolean,
): Promise<FunnelStep[]> => {
  const createdAt = { gte: period.from, lt: period.to };
  const role = includeAdmins ? {} : { role: { not: 'ADMIN' as const } };
  const [[formVisitors], created, verified, profiled, participated] = await Promise.all([
    prisma.$queryRaw<{ visitors: bigint }[]>`
      SELECT count(DISTINCT coalesce("ipAddress", "userAgent")) AS visitors
        FROM "PageVisit" WHERE ${where(period)} AND path = '/autenticacion/registro'`,
    prisma.user.count({ where: { createdAt, ...role } }),
    prisma.user.count({ where: { createdAt, ...role, emailVerified: true } }),
    prisma.user.count({
      where: {
        createdAt,
        ...role,
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
        ...role,
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

export type ModuleUsage = { key: string; label: string; count: number };

/**
 * What people did in each module during the period (content created, sign-ups, likes, marks),
 * keyed by the module's section. Admins' own actions only when `includeAdmins`.
 */
const moduleUsage = async (period: Period, includeAdmins: boolean) => {
  const createdAt = { gte: period.from, lt: period.to };
  const admin = { role: 'ADMIN' as const };
  const notAuthor = includeAdmins ? {} : { NOT: { author: admin } };
  const notUser = includeAdmins ? {} : { NOT: { user: admin } };
  const [
    registrations,
    proposals,
    advice,
    comments,
    likes,
    forumPosts,
    forumComments,
    forumLikes,
    galleryUploads,
    galleryTags,
    setups,
    setupLikes,
    projects,
    articlesRead,
    articlesSaved,
    videos,
  ] = await Promise.all([
    prisma.eventRegistration.count({ where: { createdAt, cancelledAt: null, ...notUser } }),
    prisma.talkProposal.count({ where: { createdAt, ...notUser } }),
    prisma.advice.count({ where: { createdAt, ...notAuthor } }),
    prisma.comment.count({ where: { createdAt, ...notAuthor } }),
    prisma.like.count({ where: { createdAt, ...notUser } }),
    prisma.forumPost.count({ where: { createdAt, ...notAuthor } }),
    prisma.forumComment.count({ where: { createdAt, ...notAuthor } }),
    prisma.forumPostLike.count({ where: { createdAt, ...notUser } }),
    prisma.galleryItem.count({
      where: {
        createdAt,
        legacyId: null,
        ...(includeAdmins ? {} : { NOT: { uploadedBy: admin } }),
      },
    }),
    prisma.galleryItemTag.count({
      where: { createdAt, ...(includeAdmins ? {} : { NOT: { taggedBy: admin } }) },
    }),
    prisma.setup.count({ where: { createdAt, ...notAuthor } }),
    prisma.setupLike.count({ where: { createdAt, ...notUser } }),
    prisma.project.count({ where: { createdAt, ...notAuthor } }),
    prisma.contentMark.count({
      where: { createdAt, contentType: 'article', mark: 'read', ...notUser },
    }),
    prisma.contentMark.count({
      where: { createdAt, contentType: 'article', mark: 'saved', ...notUser },
    }),
    prisma.contentMark.count({
      where: { createdAt, contentType: 'video', mark: 'watched', ...notUser },
    }),
  ]);
  const usage: Record<string, ModuleUsage[]> = {
    '/eventos': [
      { key: 'registrations', label: 'inscripciones', count: registrations },
      { key: 'proposals', label: 'propuestas de charla', count: proposals },
    ],
    '/consejos': [
      { key: 'advice', label: 'consejos', count: advice },
      { key: 'comments', label: 'comentarios', count: comments },
      { key: 'likes', label: 'likes', count: likes },
    ],
    '/foro': [
      { key: 'forumPosts', label: 'hilos', count: forumPosts },
      { key: 'forumComments', label: 'respuestas', count: forumComments },
      { key: 'forumLikes', label: 'likes', count: forumLikes },
    ],
    '/galeria': [
      { key: 'galleryUploads', label: 'fotos y videos subidos', count: galleryUploads },
      { key: 'galleryTags', label: 'etiquetas', count: galleryTags },
    ],
    '/setups': [
      { key: 'setups', label: 'setups', count: setups },
      { key: 'setupLikes', label: 'likes', count: setupLikes },
    ],
    '/proyectos': [{ key: 'projects', label: 'proyectos', count: projects }],
    '/lectura': [
      { key: 'articlesRead', label: 'leídos', count: articlesRead },
      { key: 'articlesSaved', label: 'guardados', count: articlesSaved },
    ],
    '/videos': [{ key: 'videos', label: 'vistos', count: videos }],
  };
  return usage;
};

export type ModuleUsageMap = Awaited<ReturnType<typeof moduleUsage>>;

const countOf = (usage: ModuleUsageMap, key: string) =>
  Object.values(usage)
    .flat()
    .find((item) => item.key === key)?.count ?? 0;

/** The site-wide engagement tiles, out of the per-module usage. */
const engagementOf = (usage: ModuleUsageMap) => ({
  registrations: countOf(usage, 'registrations'),
  advice: countOf(usage, 'advice'),
  comments: countOf(usage, 'comments'),
  likes: countOf(usage, 'likes'),
  projects: countOf(usage, 'projects'),
  proposals: countOf(usage, 'proposals'),
  articlesRead: countOf(usage, 'articlesRead'),
  videos: countOf(usage, 'videos'),
});

export type Engagement = ReturnType<typeof engagementOf>;

export type MetricsOptions = {
  /** Count admins' visits and actions too. */
  includeAdmins?: boolean;
};

export const getProductMetrics = async (
  range: MetricsRange,
  ownHosts: string[],
  { includeAdmins = false }: MetricsOptions = {},
) => {
  const previous = previousRange(range);
  const where = visitsWhere(includeAdmins);
  const signupsWhere = includeAdmins ? Prisma.empty : Prisma.sql`AND role <> 'ADMIN'`;
  const signupCount = (period: Period) =>
    prisma.user.count({
      where: {
        createdAt: { gte: period.from, lt: period.to },
        ...(includeAdmins ? {} : { role: { not: 'ADMIN' as const } }),
      },
    });
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
    usage,
    previousUsage,
    pagesByModule,
    returningByModule,
  ] = await Promise.all([
    trafficTotals(range, where),
    trafficTotals(previous, where),
    signupCount(range),
    signupCount(previous),
    timeline(range, where, signupsWhere),
    sections(range, where),
    sections(previous, where),
    topPaths(range, where, 15),
    heatmap(range, where),
    referrers(range, where, ownHosts),
    devices(range, where),
    returningVisitors(range, where),
    signupFunnel(range, where, includeAdmins),
    moduleUsage(range, includeAdmins),
    moduleUsage(previous, includeAdmins),
    modulePages(range, where),
    moduleReturning(range, where),
  ]);
  return {
    range,
    previous,
    includeAdmins,
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
    activity: engagementOf(usage),
    previousActivity: engagementOf(previousUsage),
    usage,
    previousUsage,
    pagesByModule,
    returningByModule,
  };
};

export type ProductMetrics = Awaited<ReturnType<typeof getProductMetrics>>;

/** How long a computed dashboard is reused. The page is public, so anyone can ask for it. */
export const METRICS_CACHE_SECONDS = 3600;

type RangeParams = { rango?: string; desde?: string; hasta?: string; admins?: string };

/** `?admins=1` counts admins too; by default they're left out. */
export const includesAdmins = (params: { admins?: string }) => params.admins === '1';

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
    getProductMetrics(parseMetricsRange(params), ownHosts, {
      includeAdmins: includesAdmins(params),
    }),
  ['product-metrics'],
  { revalidate: METRICS_CACHE_SECONDS },
);

/**
 * getProductMetrics for the page's query string, computed at most once an hour per range and
 * admin filter. The cache key is the preset (`30d`) or the custom dates, not the instants they
 * resolve to, so a preset keeps hitting the same entry while `now` moves.
 */
export const getCachedProductMetrics = async (params: RangeParams, ownHosts: string[]) => {
  const { preset } = parseMetricsRange(params);
  const dates = preset ? { rango: preset } : { desde: params.desde, hasta: params.hasta };
  const key = includesAdmins(params) ? { ...dates, admins: '1' } : dates;
  return reviveDates(await cachedProductMetrics(key, ownHosts));
};
