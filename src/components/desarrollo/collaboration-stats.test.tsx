import { render, screen } from '@testing-library/react';
import { getAdminUser } from '@/lib/admin';
import { getCollaborationStats, type CollaborationStats as Stats } from '@/lib/github-stats';
import { getIdentityMap } from '@/lib/identity-links';
import { CollaborationStats, CollaborationStatsSkeleton } from './collaboration-stats';

jest.mock('@/lib/github-stats', () => ({ getCollaborationStats: jest.fn() }));
jest.mock('@/lib/identity-links', () => ({ getIdentityMap: jest.fn() }));
jest.mock('@/lib/admin', () => ({ getAdminUser: jest.fn() }));
jest.mock('next/image', () => ({
  __esModule: true,
  // eslint-disable-next-line @next/next/no-img-element
  default: (props: { src: string; alt: string }) => <img src={props.src} alt={props.alt} />,
}));

const contributor = (login: string, overrides: Partial<Stats['topContributors'][number]> = {}) => ({
  login,
  avatarUrl: `https://avatars.example/${login}`,
  htmlUrl: `https://github.com/${login}`,
  commits: 1234,
  mergedPrs: 10,
  linesAdded: 1_500_000,
  linesDeleted: 2_300,
  firstContributionWeek: '2023-03-05T00:00:00Z',
  ...overrides,
});

const baseStats: Stats = {
  updatedAt: '2026-10-01T12:00:00Z',
  stars: 1500,
  forks: 42,
  commits: 4321,
  contributors: 3,
  mergedPrs: 300,
  openPrs: 4,
  medianHoursToMerge: 5.4,
  createdAt: '2026-09-30T12:00:00Z',
  pushedAt: '2026-10-01T12:00:00Z',
  weeklyCommits: [0, 3, 10],
  languages: [
    { name: 'TypeScript', percent: 92.3 },
    { name: 'CSS', percent: 4.56 },
    { name: 'Elixir', percent: 0.05 },
  ],
  linesOfCode: 123456,
  topContributors: [
    contributor('ana', { mergedPrs: 20 }),
    contributor('beto', {
      mergedPrs: 0,
      linesAdded: null,
      linesDeleted: null,
      firstContributionWeek: null,
      commits: 5,
    }),
    contributor('caro', { mergedPrs: 1, linesAdded: 999, linesDeleted: 12_000 }),
  ],
};

const renderStats = async (stats: Partial<Stats> = {}, admin = false) => {
  jest.mocked(getCollaborationStats).mockResolvedValue({ ...baseStats, ...stats });
  jest
    .mocked(getIdentityMap)
    .mockResolvedValue({ ana: { id: 'u1', name: 'Ana María', image: null } } as never);
  jest.mocked(getAdminUser).mockResolvedValue(admin ? ({ id: 'admin' } as never) : null);
  return render(await CollaborationStats());
};

describe('CollaborationStats', () => {
  beforeEach(() => {
    jest.useFakeTimers({ now: new Date('2026-10-04T12:00:00Z'), advanceTimers: true });
  });
  afterEach(() => jest.useRealTimers());

  it('shows the headline numbers', async () => {
    await renderStats();

    expect(screen.getByText('4.321')).toBeInTheDocument();
    expect(screen.getByText('300')).toBeInTheDocument();
    expect(screen.getByText('4 abiertas')).toBeInTheDocument();
    expect(screen.getByText('5h')).toBeInTheDocument();
    expect(screen.getByText('1.500')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(getIdentityMap).toHaveBeenCalledWith('github');
  });

  it.each([
    [null, '—'],
    [0.2, '12m'],
    [0.001, '1m'],
    [72, '3d'],
  ])('formats a median merge time of %p hours as %s', async (hours, label) => {
    await renderStats({ medianHoursToMerge: hours });
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it('draws the weekly activity and the language breakdown', async () => {
    await renderStats();

    expect(
      screen.getByRole('img', {
        name: 'Commits por semana en el último año: 13 en total, máximo 10 en una semana',
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('· 2 semanas activas')).toBeInTheDocument();
    expect(
      screen.getByRole('img', {
        name: 'Lenguajes del repo: TypeScript 92%, CSS 4,6%, Elixir <0,1%',
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('123.456')).toBeInTheDocument();
  });

  it('hides the activity and languages without data', async () => {
    await renderStats({ weeklyCommits: [], languages: [], linesOfCode: null });

    expect(screen.queryByRole('img', { name: /Commits por semana/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('img', { name: /Lenguajes/ })).not.toBeInTheDocument();
    expect(screen.queryByText('líneas de código')).not.toBeInTheDocument();
  });

  it('shows lines of code even without a language breakdown', async () => {
    await renderStats({ languages: [] });
    expect(screen.getByText('líneas de código')).toBeInTheDocument();
    expect(screen.queryByText(/github-linguist/)).not.toBeInTheDocument();
  });

  it('ranks the contributors with bars, line counts and linked profiles', async () => {
    const { container } = await renderStats();

    expect(screen.getByText('· 3 personas')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'ana' })).toHaveAttribute(
      'href',
      'https://github.com/ana',
    );
    expect(screen.getByRole('link', { name: '~/ana →' })).toHaveAttribute('href', '/perfil/u1');
    expect(screen.queryByRole('link', { name: /~\/beto/ })).not.toBeInTheDocument();
    expect(screen.getByText('+1,5M')).toBeInTheDocument();
    expect(screen.getByText('−2,3k')).toBeInTheDocument();
    expect(screen.getByText('+999')).toBeInTheDocument();
    expect(screen.getAllByTitle(/Primer commit/)).toHaveLength(2);

    const bars = Array.from(container.querySelectorAll('li .tracking-tighter')).map(
      (bar) => bar.children[0].textContent!.length,
    );
    // Full bar for the top one, empty for zero PRs, at least one block for any PR.
    expect(bars).toEqual([20, 0, 1]);
  });

  it('gives empty bars when nobody has merged PRs', async () => {
    const { container } = await renderStats({
      topContributors: [contributor('solo', { mergedPrs: 0 })],
    });
    expect(container.querySelector('li .tracking-tighter')!.textContent).toBe('░'.repeat(20));
  });

  it.each([
    ['2026-10-04T10:00:00Z', 'hoy'],
    ['2026-09-30T12:00:00Z', 'hace 4 días'],
    ['2026-06-01T12:00:00Z', 'hace 4 meses'],
    ['2023-10-01T12:00:00Z', 'hace 3 años'],
  ])('says the repo was created %s as "%s"', async (createdAt, label) => {
    await renderStats({ createdAt });
    expect(screen.getByText(new RegExp(`repo creado ${label}`))).toBeInTheDocument();
  });

  it('links to /vinculos only for admins', async () => {
    await renderStats({}, true);
    expect(screen.getByRole('link', { name: 'vincular perfiles →' })).toHaveAttribute(
      'href',
      '/vinculos',
    );
  });

  it('has no admin link for everyone else', async () => {
    await renderStats();
    expect(screen.queryByRole('link', { name: 'vincular perfiles →' })).not.toBeInTheDocument();
  });

  it('renders a skeleton with six stat cells', () => {
    const { container } = render(<CollaborationStatsSkeleton />);
    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(7);
  });
});
