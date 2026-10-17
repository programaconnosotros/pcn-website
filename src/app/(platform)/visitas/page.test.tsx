import { render, screen, within } from '@testing-library/react';
import { fetchPageVisits, getPageVisitStats } from '@/actions/analytics/fetch-page-visits';
import { findSession } from '@/lib/session';
import { mockCookies } from '@/test/cookies';
import {
  adminRow,
  expectOnlyPlaceholders,
  renderPage,
  sessionRow,
  thrownBy,
} from '@/test/pages-m-z';
import VisitasLayout, { metadata } from './layout';
import Loading from './loading';
import VisitasPage from './page';

jest.mock('next/headers', () => ({ cookies: jest.fn(), headers: jest.fn() }));
jest.mock('@/lib/session', () => ({ findSession: jest.fn() }));
jest.mock('@/actions/analytics/fetch-page-visits', () => ({
  fetchPageVisits: jest.fn(),
  getPageVisitStats: jest.fn(),
}));

const NOW = new Date('2026-05-10T12:00:00Z');
const ago = (ms: number) => new Date(NOW.getTime() - ms);
const MINUTE = 60_000;

const stats = {
  totalVisits: 1500,
  visitsToday: 12,
  uniquePaths: 8,
  uniqueUsers: 40,
  topPages: [
    { path: '/eventos', count: 100 },
    { path: '/charlas', count: 50 },
  ],
};

const signInAsAdmin = (visits: unknown[]) => {
  mockCookies({ sessionId: 'token' });
  jest.mocked(findSession).mockResolvedValue(adminRow());
  jest.mocked(fetchPageVisits).mockResolvedValue(visits as never);
  jest.mocked(getPageVisitStats).mockResolvedValue(stats as never);
};

describe('/visitas', () => {
  beforeEach(() => {
    jest.useFakeTimers({ now: NOW, doNotFake: ['setTimeout', 'setInterval', 'queueMicrotask'] });
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('is an admin listing kept out of search engines, set in its layout', () => {
    expect(metadata).toMatchObject({
      title: 'sudo ls ~/visitas',
      robots: { index: false, follow: false },
    });
    render(<VisitasLayout>tabla</VisitasLayout>);
    expect(screen.getByText('tabla')).toBeInTheDocument();
  });

  it('sends anyone who is not an admin home', async () => {
    mockCookies();
    expect(await thrownBy(() => VisitasPage())).toBe('NEXT_REDIRECT:/');

    mockCookies({ sessionId: 'token' });
    jest.mocked(findSession).mockResolvedValueOnce(sessionRow());
    expect(await thrownBy(() => VisitasPage())).toBe('NEXT_REDIRECT:/');

    jest.mocked(findSession).mockResolvedValueOnce(null);
    expect(await thrownBy(() => VisitasPage())).toBe('NEXT_REDIRECT:/');
    expect(fetchPageVisits).not.toHaveBeenCalled();
  });

  it('shows the totals and the most visited pages, scaled to the first', async () => {
    signInAsAdmin([]);
    await renderPage(VisitasPage());

    expect(fetchPageVisits).toHaveBeenCalledWith(500);
    expect(screen.getByText((1500).toLocaleString())).toBeInTheDocument();
    expect(screen.getByText('rutas únicas').previousElementSibling).toHaveTextContent('8');
    const top = screen.getByText('/charlas').closest('li')!;
    expect(within(top).getByText('02')).toBeInTheDocument();
    expect(top.querySelector('[style]')).toHaveStyle({ width: '50%' });
    expect(screen.getByText('Aún no hay visitas registradas.')).toBeInTheDocument();
  });

  it('lists recent visits with who, when (relative) and where they came from', async () => {
    signInAsAdmin([
      {
        id: 'v1',
        path: '/a',
        user: { name: 'Ana', email: 'ana@x.com' },
        createdAt: ago(10_000),
        referer: 'https://google.com',
      },
      { id: 'v2', path: '/b', user: null, createdAt: ago(1 * MINUTE), referer: null },
      { id: 'v3', path: '/c', user: null, createdAt: ago(5 * MINUTE), referer: null },
      { id: 'v4', path: '/d', user: null, createdAt: ago(60 * MINUTE), referer: null },
      { id: 'v5', path: '/e', user: null, createdAt: ago(3 * 60 * MINUTE), referer: null },
      { id: 'v6', path: '/f', user: null, createdAt: ago(24 * 60 * MINUTE), referer: null },
      { id: 'v7', path: '/g', user: null, createdAt: ago(72 * 60 * MINUTE), referer: null },
    ]);
    await renderPage(VisitasPage());

    const row = (path: string) => screen.getByText(path).closest('tr')!;
    expect(within(row('/a')).getByTitle('ana@x.com')).toHaveTextContent('Ana');
    expect(row('/a')).toHaveTextContent('Hace menos de un minuto');
    expect(row('/a')).toHaveTextContent('https://google.com');
    expect(row('/b')).toHaveTextContent('anónimo');
    expect(row('/b')).toHaveTextContent('Hace 1 minuto');
    expect(row('/b')).toHaveTextContent('directo');
    expect(row('/c')).toHaveTextContent('Hace 5 minutos');
    expect(row('/d')).toHaveTextContent('Hace 1 hora');
    expect(row('/e')).toHaveTextContent('Hace 3 horas');
    expect(row('/f')).toHaveTextContent('Hace 1 día');
    expect(row('/g')).toHaveTextContent('Hace 3 días');
  });

  it('shows only placeholders while loading', () => {
    expectOnlyPlaceholders(<Loading />);
  });
});
