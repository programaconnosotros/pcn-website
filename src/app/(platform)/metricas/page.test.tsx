import { screen } from '@testing-library/react';
import { getCachedProductMetrics, type ProductMetrics } from '@/lib/product-metrics';
import { expectOnlyPlaceholders, renderPage } from '@/test/pages-m-z';
import Loading from './loading';
import MetricasPage, { metadata } from './page';

jest.mock('@/lib/product-metrics', () => ({ getCachedProductMetrics: jest.fn() }));
jest.mock('@/components/admin/metrics/range-filter', () => ({
  RangeFilter: (props: { preset: string | null; from: Date; to: Date }) => (
    <div data-testid="range-filter" data-preset={props.preset ?? ''}>
      {props.from.toISOString()}|{props.to.toISOString()}
    </div>
  ),
}));
jest.mock('@/components/admin/metrics/traffic-chart', () => ({
  TrafficChart: (props: { unit: string; points: { day: string }[] }) => (
    <div data-testid="traffic-chart" data-unit={props.unit}>
      {props.points.map((point) => point.day).join(',')}
    </div>
  ),
}));

const traffic = { visits: 1200, visitors: 400, members: 30 };
const activityOf = (n: number) => ({
  registrations: n,
  articlesRead: n,
  videos: n,
  likes: n,
  comments: n,
  advice: n,
  projects: n,
  proposals: n,
});

const buildMetrics = (overrides: Partial<ProductMetrics> = {}) =>
  ({
    range: {
      from: new Date('2026-03-01T03:00:00Z'),
      to: new Date('2026-03-31T03:00:00Z'),
      preset: '30d',
    },
    previous: {
      from: new Date('2026-01-30T03:00:00Z'),
      to: new Date('2026-03-01T03:00:00Z'),
    },
    traffic,
    previousTraffic: { visits: 1000, visitors: 200, members: 20 },
    signups: 20,
    previousSignups: 4,
    series: {
      unit: 'day',
      points: [
        { day: new Date('2026-03-01T03:00:00Z'), visits: 10, visitors: 5, signups: 1 },
        { day: new Date('2026-03-02T03:00:00Z'), visits: 20, visitors: 8, signups: 0 },
      ],
    },
    modules: [],
    previousModules: [],
    pages: [],
    hours: Array.from({ length: 7 }, () => Array(24).fill(0)),
    sources: [{ host: 'google.com', visits: 33 }],
    deviceSplit: { desktop: 70, mobile: 30, tablet: 0, bots: 12 },
    returning: 100,
    funnel: [
      { id: 'visit', label: 'visitas', hint: '', count: 400 },
      { id: 'signup', label: 'altas', hint: '', count: 20 },
      { id: 'active', label: 'activas', hint: '', count: 5 },
    ],
    activity: activityOf(3),
    previousActivity: activityOf(1),
    ...overrides,
  }) as unknown as ProductMetrics;

const metricsMock = jest.mocked(getCachedProductMetrics);

/** A KPI tile's value, the line right below its label. */
const tileValue = (label: string) =>
  screen.getAllByText(label, { selector: 'span' })[0].nextElementSibling;

describe('/metricas', () => {
  it('has a public title and description', () => {
    expect(metadata.title).toBe('ls ~/metricas');
    expect(metadata.description).toMatch(/métricas de producto/);
  });

  it('asks for the range in the query string and leaves the site itself out of the referers', async () => {
    metricsMock.mockResolvedValue(buildMetrics());
    await renderPage(MetricasPage({ searchParams: Promise.resolve({ rango: '7d' }) }));

    const [params, hosts] = metricsMock.mock.calls[0];
    expect(params).toEqual({ rango: '7d' });
    expect(hosts).toEqual(
      expect.arrayContaining(['programaconnosotros.com', 'localhost', 'pcn-website.localhost']),
    );
  });

  it('shows the KPIs, the conversion and the range command line', async () => {
    metricsMock.mockResolvedValue(buildMetrics());
    await renderPage(MetricasPage({ searchParams: Promise.resolve({}) }));

    expect(screen.getByText(/--from 2026-03-01 --to 2026-03-30/)).toBeInTheDocument();
    expect(tileValue('visitas')).toHaveTextContent('1.200');
    expect(tileValue('visitantes únicos')).toHaveTextContent('400');
    // 20 signups out of 400 visitors
    expect(tileValue('conversión a alta')).toHaveTextContent('5%');
    // 100 returning out of 400
    expect(tileValue('visitantes que vuelven')).toHaveTextContent('25%');
    expect(screen.getByText('100 en 2+ días')).toBeInTheDocument();
    // activation: 5 active of 20 new accounts
    expect(screen.getByText('activación 25% de las cuentas nuevas')).toBeInTheDocument();
    expect(screen.getByText('inscripciones a eventos')).toBeInTheDocument();
  });

  it('hands the range to the filter and the series to the chart with ISO days', async () => {
    metricsMock.mockResolvedValue(buildMetrics());
    await renderPage(MetricasPage({ searchParams: Promise.resolve({}) }));

    const filter = screen.getByTestId('range-filter');
    expect(filter).toHaveAttribute('data-preset', '30d');
    // The filter gets the last day included, one millisecond before the end.
    expect(filter).toHaveTextContent('2026-03-01T03:00:00.000Z|2026-03-31T02:59:59.999Z');
    const chart = screen.getByTestId('traffic-chart');
    expect(chart).toHaveAttribute('data-unit', 'day');
    expect(chart).toHaveTextContent('2026-03-01T03:00:00.000Z,2026-03-02T03:00:00.000Z');
  });

  it('lists sources and devices, skipping devices without visits and noting bots', async () => {
    metricsMock.mockResolvedValue(buildMetrics());
    await renderPage(MetricasPage({ searchParams: Promise.resolve({}) }));

    expect(screen.getByText('google.com')).toBeInTheDocument();
    expect(screen.getByText('12 visitas de bots aparte')).toBeInTheDocument();
    expect(screen.getByText('desktop')).toBeInTheDocument();
    expect(screen.getByText('mobile')).toBeInTheDocument();
    expect(screen.queryByText('tablet')).not.toBeInTheDocument();
  });

  it('copes with an empty period: no visitors, no bots, no sources', async () => {
    metricsMock.mockResolvedValue(
      buildMetrics({
        traffic: { visits: 0, visitors: 0, members: 0 },
        previousTraffic: { visits: 0, visitors: 0, members: 0 },
        signups: 0,
        previousSignups: 0,
        returning: 0,
        sources: [],
        deviceSplit: { desktop: 0, mobile: 0, tablet: 0, bots: 0 },
        funnel: [],
      } as Partial<ProductMetrics>),
    );
    await renderPage(MetricasPage({ searchParams: Promise.resolve({}) }));

    expect(screen.getByText('todas las visitas son directas')).toBeInTheDocument();
    expect(screen.queryByText(/visitas de bots aparte/)).not.toBeInTheDocument();
    expect(screen.getByText('activación 0% de las cuentas nuevas')).toBeInTheDocument();
    expect(tileValue('conversión a alta')).toHaveTextContent('0%');
  });

  it('shows only placeholders while loading', () => {
    expectOnlyPlaceholders(<Loading />);
  });
});
