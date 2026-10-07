import { screen, within } from '@testing-library/react';
import { renderInPlatform } from '@/test/platform';
import { getCurrentSession } from '@/actions/auth/get-current-session';
import { getAchievementMetrics } from '@/lib/achievement-metrics';
import { ACHIEVEMENTS, EMPTY_METRICS, type AchievementMetrics } from '@/lib/achievements';
import prisma from '@/lib/prisma';
import LogrosPage, { metadata } from './page';
import Loading from './loading';

jest.mock('@/actions/auth/get-current-session', () => ({ getCurrentSession: jest.fn() }));
jest.mock('@/lib/achievement-metrics', () => ({ getAchievementMetrics: jest.fn() }));
jest.mock('@/lib/cache', () => ({ cached: (_name: string, read: unknown) => read }));
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    user: { count: jest.fn(), findMany: jest.fn() },
    badge: { findMany: jest.fn() },
  },
}));

const metrics = (overrides: Partial<AchievementMetrics> = {}) => ({
  ...EMPTY_METRICS,
  ...overrides,
});

// Thirteen contributors: one more than the avatars shown before "ver más".
const contributors = Array.from({ length: 13 }, (_, index) => ({
  id: `c${index}`,
  name: `Persona ${String.fromCharCode(77 - index)}`,
  image: null,
}));
const ana = { id: 'ana', name: 'Ana López', image: 'ana.png' };

const setData = ({
  members = 20,
  viewerMetrics,
}: { members?: number; viewerMetrics?: AchievementMetrics } = {}) => {
  const map = new Map<string, AchievementMetrics>(
    contributors.map(({ id }) => [id, metrics({ commits: 3 })]),
  );
  if (viewerMetrics) map.set(ana.id, viewerMetrics);
  jest.mocked(getAchievementMetrics).mockResolvedValue(map);
  jest.mocked(prisma.user.count).mockResolvedValue(members);
  jest
    .mocked(prisma.user.findMany)
    .mockResolvedValueOnce([
      { id: 'f1', name: 'Zoe', image: null, isCofounder: true, isAmbassador: false },
      { id: 'f2', name: 'Bruno', image: null, isCofounder: true, isAmbassador: true },
    ] as never)
    .mockResolvedValueOnce([...contributors, ...(viewerMetrics ? [ana] : [])] as never);
  jest.mocked(prisma.badge.findMany).mockResolvedValue([
    {
      id: 'b1',
      name: 'Mentor',
      description: 'Ayudó a otros',
      icon: 'not-an-icon',
      tone: 'not-a-tone',
      awards: [{ user: ana }],
    },
  ] as never);
};

const signIn = (user: { id: string; name: string } | null) =>
  jest.mocked(getCurrentSession).mockResolvedValue((user && { user }) as never);

const card = (name: string) =>
  screen.getByRole('heading', { level: 3, name }).closest('article') as HTMLElement;

describe('/logros', () => {
  it('describes the page', () => {
    expect(metadata.title).toBe('ls ~/logros');
    expect(metadata.openGraph).toMatchObject({ url: expect.stringMatching(/\/logros$/) });
  });

  it('renders a loading skeleton', () => {
    expect(renderInPlatform(<Loading />).container.firstChild).not.toBeNull();
  });

  it('invites visitors to sign in and lists who earned each badge', async () => {
    signIn(null);
    setData();
    renderInPlatform(await LogrosPage());

    expect(screen.getByRole('link', { name: 'iniciá sesión' })).toHaveAttribute(
      'href',
      '/autenticacion/iniciar-sesion',
    );
    expect(screen.queryByText('tuyo')).not.toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();

    const contributor = card('Contributor');
    expect(contributor).toHaveTextContent('13 miembros lo tienen · 65% de la comunidad');
    expect(within(contributor).getByText('+1 más')).toBeInTheDocument();
    // Holders are sorted by name: the 13th alphabetically is folded away.
    const links = within(contributor).getAllByTitle(/Persona/);
    expect(links[0]).toHaveAttribute('title', 'Persona A');
    expect(links[0]).toHaveAttribute('href', '/perfil/c12');

    expect(within(card('Speaker')).getByText(/nadie todavía/)).toBeInTheDocument();
    expect(card('Co-founder')).toHaveTextContent('2 miembros lo tienen');
    expect(card('PCN Ambassador')).toHaveTextContent('1 miembro lo tiene');
    expect(card('Mentor')).toHaveTextContent('Lo otorga el equipo de PCN.');
    expect(screen.getByText('[3]')).toBeInTheDocument();
  });

  it('shows less than 1% for a badge few members have', async () => {
    signIn(null);
    setData({ members: 5000 });
    renderInPlatform(await LogrosPage());
    expect(card('Contributor')).toHaveTextContent('· <1% de la comunidad');
  });

  it('shows the member what they earned and the closest next badge', async () => {
    signIn({ id: ana.id, name: 'Ana López' });
    setData({ viewerMetrics: metrics({ talksGiven: 1, talksWatched: 10, articlesRead: 20 }) });
    renderInPlatform(await LogrosPage());

    expect(screen.getByText(/achievements --user ana/)).toBeInTheDocument();
    expect(screen.getByText(`1/${ACHIEVEMENTS.length}`)).toBeInTheDocument();
    expect(screen.getByText(/próximo:/)).toHaveTextContent(
      'próximo: Lector — te faltan 5 para leer 25 artículos.',
    );

    expect(within(card('Speaker')).getByText('tuyo')).toBeInTheDocument();
    expect(within(card('Lector')).getByRole('progressbar')).toHaveAttribute('aria-valuenow', '20');
    expect(within(card('Lector')).getByLabelText('Bloqueado')).toBeInTheDocument();
    // Awarded custom badge counts as hers; the co-founder one is locked.
    expect(within(card('Mentor')).getByText('tuyo')).toBeInTheDocument();
    expect(within(card('Co-founder')).getByLabelText('Bloqueado')).toBeInTheDocument();
  });

  it('suggests picking a badge when the member has no progress yet', async () => {
    signIn({ id: 'nobody', name: 'Nadie' });
    setData();
    renderInPlatform(await LogrosPage());

    expect(screen.getByText(`0/${ACHIEVEMENTS.length}`)).toBeInTheDocument();
    expect(screen.getByText(/elegí un logro de la lista/)).toBeInTheDocument();
  });

  it('has no suggestion once every badge is earned', async () => {
    signIn({ id: ana.id, name: 'Ana' });
    setData({
      viewerMetrics: {
        talksGiven: 99,
        commits: 99,
        contributorRank: 1,
        speakerRank: 1,
        conversationsRank: 1,
        consejosRank: 1,
        talksWatched: 99,
        eventsOrganized: 99,
        articlesRead: 99,
        eventsAttended: 99,
        conversations: 999,
        projectsShared: 99,
        consejos: 99,
      },
    });
    renderInPlatform(await LogrosPage());

    expect(screen.getByText(`${ACHIEVEMENTS.length}/${ACHIEVEMENTS.length}`)).toBeInTheDocument();
    expect(screen.queryByText(/próximo:|elegí un logro/)).not.toBeInTheDocument();
  });
});
