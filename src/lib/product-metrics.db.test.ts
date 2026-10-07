import prisma from '@/lib/prisma';
import { getProductMetrics } from '@/lib/product-metrics';
import { parseMetricsRange } from '@/lib/metrics-range';
import { createTestEvent, createUser } from '@/test/db/content-fixtures';

// Las agregaciones en SQL de /metricas con datos conocidos. Todo pasa en marzo de 2020 (y en el
// período anterior, fines de febrero), fechas en las que ningún otro test crea filas, así los
// números son exactos aunque la base tenga datos de otros tests.

// 2 al 4 de marzo de 2020, en hora de Argentina (UTC-3): [2020-03-02T03:00Z, 2020-03-05T03:00Z)
const range = parseMetricsRange({ desde: '2020-03-02', hasta: '2020-03-04' });
const OWN_HOSTS = ['programaconnosotros.com', 'localhost'];
const at = (iso: string) => new Date(iso);

const DESKTOP = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)';
const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Mobile';
const IPAD = 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)';
const BOT = 'Googlebot/2.1 (+http://www.google.com/bot.html)';

let metrics: Awaited<ReturnType<typeof getProductMetrics>>;
let member: Awaited<ReturnType<typeof createUser>>;

beforeAll(async () => {
  member = await createUser({ createdAt: at('2020-01-01T00:00:00Z') });

  await prisma.pageVisit.createMany({
    data: [
      // 2/3 (local): mediodía y 23 h local, que en UTC ya es 3/3
      {
        path: '/eventos/abc',
        ipAddress: '10.0.0.1',
        userAgent: DESKTOP,
        referer: 'https://www.google.com/search?q=pcn',
        createdAt: at('2020-03-02T15:00:00Z'),
      },
      {
        path: '/eventos',
        ipAddress: '10.0.0.1',
        userAgent: DESKTOP,
        referer: 'https://programaconnosotros.com/',
        createdAt: at('2020-03-03T02:00:00Z'),
        userId: member.id,
      },
      // 3/3: la misma IP vuelve otro día, y un iPhone
      {
        path: '/eventos/abc',
        ipAddress: '10.0.0.1',
        userAgent: DESKTOP,
        createdAt: at('2020-03-03T18:30:00Z'),
      },
      {
        path: '/autenticacion/registro',
        ipAddress: '10.0.0.2',
        userAgent: IPHONE,
        referer: 'https://t.co/x',
        createdAt: at('2020-03-03T18:45:00Z'),
      },
      // 4/3: un iPad, un bot y otra visita al registro sin IP (cuenta por user agent)
      {
        path: '/autenticacion/registro',
        ipAddress: '10.0.0.3',
        userAgent: IPAD,
        referer: 'https://google.com/',
        createdAt: at('2020-03-04T21:00:00Z'),
      },
      {
        path: '/charlas',
        ipAddress: '10.0.0.4',
        userAgent: BOT,
        createdAt: at('2020-03-04T22:00:00Z'),
      },
      {
        path: '/autenticacion/registro',
        ipAddress: null,
        userAgent: 'agente-sin-ip',
        createdAt: at('2020-03-05T02:59:00Z'),
      },
      // Fuera del rango: el 5/3 local y el período anterior
      {
        path: '/eventos',
        ipAddress: '10.0.0.9',
        userAgent: DESKTOP,
        createdAt: at('2020-03-05T03:00:00Z'),
      },
      {
        path: '/eventos',
        ipAddress: '10.0.0.8',
        userAgent: DESKTOP,
        createdAt: at('2020-02-28T12:00:00Z'),
      },
      {
        path: '/charlas',
        ipAddress: '10.0.0.8',
        userAgent: DESKTOP,
        createdAt: at('2020-03-01T12:00:00Z'),
      },
    ],
  });

  // Embudo de registro: 3 cuentas en el rango, 2 verificadas, 2 con perfil, 1 que participó
  await createUser({ emailVerified: false, createdAt: at('2020-03-02T20:00:00Z') });
  await createUser({ slogan: 'Hola', createdAt: at('2020-03-03T20:00:00Z') });
  const active = await createUser({ image: '/yo.png', createdAt: at('2020-03-04T20:00:00Z') });
  // Una cuenta del período anterior
  await createUser({ createdAt: at('2020-03-01T20:00:00Z') });

  const event = await createTestEvent({ date: at('2020-03-20T22:00:00Z') });
  await prisma.eventRegistration.create({
    data: { eventId: event.id, userId: active.id, createdAt: at('2020-03-04T21:00:00Z') },
  });
  await prisma.eventRegistration.create({
    data: {
      eventId: event.id,
      userId: member.id,
      createdAt: at('2020-03-04T21:00:00Z'),
      cancelledAt: at('2020-03-04T22:00:00Z'),
    },
  });
  await prisma.advice.create({
    data: { content: 'Un consejo', authorId: member.id, createdAt: at('2020-03-03T12:00:00Z') },
  });
  await prisma.advice.create({
    data: {
      content: 'Otro, del período anterior',
      authorId: member.id,
      createdAt: at('2020-03-01T12:00:00Z'),
    },
  });

  metrics = await getProductMetrics(range, OWN_HOSTS);
});

it('resolves the custom range in Argentina time and the previous period of the same length', () => {
  expect(range.from).toEqual(at('2020-03-02T03:00:00Z'));
  expect(range.to).toEqual(at('2020-03-05T03:00:00Z'));
  expect(metrics.previous).toEqual({ from: at('2020-02-28T03:00:00Z'), to: range.from });
});

it('counts visits, distinct visitors (IP, else user agent) and members', () => {
  expect(metrics.traffic).toEqual({ visits: 7, visitors: 5, members: 1 });
  expect(metrics.previousTraffic).toEqual({ visits: 2, visitors: 1, members: 0 });
});

it('buckets the timeline per local day, with signups', () => {
  const byDay = Object.fromEntries(
    metrics.series.points.map((p) => [
      p.day.toISOString().slice(0, 10),
      [p.visits, p.visitors, p.signups],
    ]),
  );
  expect(metrics.series.unit).toBe('day');
  expect(byDay['2020-03-02']).toEqual([2, 1, 1]);
  expect(byDay['2020-03-03']).toEqual([2, 2, 1]);
  expect(byDay['2020-03-04']).toEqual([3, 3, 1]);
  expect(metrics.series.points.reduce((sum, p) => sum + p.visits, 0)).toBe(7);
});

it('groups pages and modules', () => {
  expect(metrics.pages.slice(0, 2)).toEqual([
    { path: '/autenticacion/registro', visits: 3, visitors: 3 },
    { path: '/eventos/abc', visits: 2, visitors: 1 },
  ]);
  // /autenticacion y /eventos empatan en visitas: el orden entre ellas no está definido
  expect(metrics.modules.map((m) => m.section).at(-1)).toBe('/charlas');
  expect([...metrics.modules].sort((a, b) => a.section.localeCompare(b.section))).toEqual([
    { section: '/autenticacion', visits: 3, visitors: 3, members: 0 },
    { section: '/charlas', visits: 1, visitors: 1, members: 0 },
    { section: '/eventos', visits: 3, visitors: 1, members: 1 },
  ]);
});

it('places each visit in the heatmap by local weekday and hour', () => {
  // 2/3/2020 fue lunes: las 15 h UTC son las 12 h en Argentina
  expect(metrics.hours[1][12]).toBe(1);
  expect(metrics.hours[1][23]).toBe(1);
  // 3/3 (martes) 18:30 y 18:45 UTC → 15 h local
  expect(metrics.hours[2][15]).toBe(2);
  expect(metrics.hours.flat().reduce((a, b) => a + b, 0)).toBe(7);
});

it('lists external referrers without www and without the site itself', () => {
  expect(metrics.sources).toEqual([
    { host: 'google.com', visits: 2 },
    { host: 't.co', visits: 1 },
  ]);
});

it('splits devices, telling bots apart', () => {
  expect(metrics.deviceSplit).toEqual({ desktop: 4, mobile: 1, tablet: 1, bots: 1 });
});

it('counts visitors that came back on another local day', () => {
  expect(metrics.returning).toBe(1);
});

it('builds the signup funnel for the accounts created in the range', () => {
  expect(metrics.signups).toBe(3);
  expect(metrics.previousSignups).toBe(1);
  expect(metrics.funnel.map((step) => [step.id, step.count])).toEqual([
    ['form', 3],
    ['created', 3],
    ['verified', 2],
    ['profile', 2],
    ['active', 1],
  ]);
});

it('counts engagement in the range, leaving cancelled registrations out', () => {
  expect(metrics.activity).toMatchObject({
    registrations: 1,
    advice: 1,
    comments: 0,
    proposals: 0,
  });
  expect(metrics.previousActivity).toMatchObject({ registrations: 0, advice: 1 });
});

it('switches to weekly buckets for long ranges', async () => {
  const long = parseMetricsRange({ desde: '2019-09-01', hasta: '2020-03-04' });
  const { series } = await getProductMetrics(long, OWN_HOSTS);
  expect(series.unit).toBe('week');
  expect(series.points.reduce((sum, p) => sum + p.visits, 0)).toBe(9);
});
