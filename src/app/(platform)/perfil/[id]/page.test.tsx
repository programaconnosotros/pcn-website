import { screen, within } from '@testing-library/react';
import { getCurrentSession } from '@/actions/auth/get-current-session';
import { ProfileBadges } from '@/components/badges/profile-badges';
import { GitHubContributions } from '@/components/profile/github-contributions';
import { LanguageCoinsContainer } from '@/components/profile/language-coins-container';
import { getUserAchievementMetrics } from '@/lib/achievement-metrics';
import { earnedAchievements } from '@/lib/achievements';
import { AMBASSADOR_BADGE, COFOUNDER_BADGE } from '@/lib/badges';
import { loadCardImage } from '@/lib/og/load-image';
import { renderTerminalCard } from '@/lib/og/terminal-card';
import prisma from '@/lib/prisma';
import {
  adminRow,
  expectOnlyPlaceholders,
  renderPage,
  sessionRow,
  thrownBy,
} from '@/test/pages-m-z';
import Loading from './loading';
import Image, { alt } from './opengraph-image';
import ProfilePage, { generateMetadata } from './page';
import { ProfileTabContent } from './profile-tab-content';

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: { user: { findUnique: jest.fn() } },
}));
jest.mock('@/lib/cache', () => ({
  cached: (_name: string, fn: (..._args: unknown[]) => unknown) => fn,
}));
jest.mock('@/actions/auth/get-current-session', () => ({ getCurrentSession: jest.fn() }));
jest.mock('@/lib/achievement-metrics', () => ({ getUserAchievementMetrics: jest.fn() }));
jest.mock('@/lib/achievements', () => ({ earnedAchievements: jest.fn() }));
jest.mock('@/components/badges/profile-badges', () => ({
  ProfileBadges: jest.fn(() => <p>insignias</p>),
}));
jest.mock('@/components/profile/github-contributions', () => ({
  GitHubContributions: jest.fn(() => <p>contribuciones en github</p>),
}));
jest.mock('@/components/profile/language-coins-container', () => ({
  LanguageCoinsContainer: jest.fn(() => <p>monedas</p>),
}));
jest.mock('./profile-tab-content', () => ({
  ProfileCountsLoader: () => null,
  ProfileTabContent: jest.fn(({ tab }: { tab: string }) => <p>pestaña {tab}</p>),
}));
jest.mock('@/lib/og/terminal-card', () => require('@/test/pages-m-z').mockTerminalCard());
jest.mock('@/lib/og/load-image', () => ({ loadCardImage: jest.fn(async () => 'data:avatar') }));

const findUser = prisma.user.findUnique as unknown as jest.Mock;

const profile = (overrides: Record<string, unknown> = {}) => ({
  id: 'p1',
  name: 'Ana López',
  email: 'ana@example.com',
  image: 'https://img/ana.png',
  phoneNumber: '+5491100000000',
  isAmbassador: false,
  isCofounder: false,
  countryOfOrigin: 'Argentina',
  province: 'Tucumán',
  slogan: null,
  jobTitle: null,
  enterprise: null,
  career: null,
  studyPlace: null,
  xAccountUrl: null,
  linkedinUrl: null,
  gitHubUrl: null,
  instagramUrl: null,
  youtubeUrl: null,
  twitchUrl: null,
  kickUrl: null,
  badges: [],
  languages: [],
  positions: [],
  createdAt: new Date('2024-03-15T12:00:00Z'),
  ...overrides,
});

const params = (id = 'p1') => Promise.resolve({ id });
const page = (tab?: string, id = 'p1') =>
  ProfilePage({ params: params(id), searchParams: Promise.resolve(tab ? { tab } : {}) });
const badgesProps = () => jest.mocked(ProfileBadges).mock.calls[0][0];
const tabProps = () => jest.mocked(ProfileTabContent).mock.calls[0][0];

beforeEach(() => {
  jest.mocked(getUserAchievementMetrics).mockResolvedValue({} as never);
  jest.mocked(earnedAchievements).mockReturnValue([]);
  jest.mocked(getCurrentSession).mockResolvedValue(null);
});

describe('/perfil/[id] metadata', () => {
  it('describes the member with their slogan', async () => {
    findUser.mockResolvedValue(profile({ slogan: 'Me gusta el café' }));

    const metadata = await generateMetadata({ params: params() });

    expect(findUser).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'p1' } }));
    expect(metadata).toMatchObject({
      title: 'cat ~/perfil/ana-lopez',
      description: 'Perfil de Ana López en programaConNosotros. Me gusta el café',
      openGraph: {
        title: 'Ana López',
        type: 'profile',
        url: expect.stringMatching(/\/perfil\/p1$/),
      },
      twitter: { card: 'summary_large_image', title: 'Ana López' },
    });
  });

  it('falls back to a generic description and cuts long ones', async () => {
    findUser.mockResolvedValueOnce(profile());
    expect((await generateMetadata({ params: params() })).description).toBe(
      'Perfil de Ana López en programaConNosotros. Miembro de la comunidad.',
    );

    findUser.mockResolvedValueOnce(profile({ slogan: 's'.repeat(200) }));
    const { description, openGraph, twitter } = await generateMetadata({ params: params() });
    expect(description).toHaveLength(160);
    expect(description).toMatch(/\.\.\.$/);
    expect(openGraph?.description).toBe(description);
    expect(twitter?.description).toBe(description);
  });

  it('says when the profile does not exist', async () => {
    findUser.mockResolvedValue(null);

    expect(await generateMetadata({ params: params('nope') })).toEqual({
      title: { absolute: '404: no such file or directory' },
      description: 'El perfil que buscas no existe.',
    });
  });
});

describe('/perfil/[id]', () => {
  it('is not found when the user does not exist', async () => {
    findUser.mockResolvedValue(null);
    expect(await thrownBy(() => page(undefined, 'nope'))).toBe('NEXT_NOT_FOUND');
  });

  it('shows a bare profile to anonymous visitors without contact data', async () => {
    findUser.mockResolvedValue(profile());

    await renderPage(page());

    expect(screen.getByRole('heading', { level: 1, name: 'Ana López' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'miembros' })).toHaveAttribute('href', '/miembros');
    expect(screen.queryByRole('link', { name: /editar perfil/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: /Redes de/ })).not.toBeInTheDocument();
    expect(GitHubContributions).not.toHaveBeenCalled();
    expect(screen.getByText('Tucumán, Argentina')).toBeInTheDocument();
    expect(screen.queryByText('ana@example.com')).not.toBeInTheDocument();
    expect(screen.queryByText('+5491100000000')).not.toBeInTheDocument();
    expect(screen.queryByText(/trabajo/)).not.toBeInTheDocument();
    expect(screen.queryByText(/estudios/)).not.toBeInTheDocument();
    expect(screen.getByText('No hay lenguajes registrados')).toBeInTheDocument();
    expect(badgesProps()).toMatchObject({ userId: 'p1', badges: [], isAdmin: false });
    expect(tabProps()).toMatchObject({
      tab: 'resumen',
      userId: 'p1',
      firstName: 'Ana',
      session: null,
      person: { id: 'p1', name: 'Ana López', image: 'https://img/ana.png' },
    });
  });

  it('shows the email and phone to members', async () => {
    findUser.mockResolvedValue(profile());
    jest.mocked(getCurrentSession).mockResolvedValue(sessionRow({ id: 'viewer' }));

    await renderPage(page());

    expect(screen.getByRole('link', { name: 'ana@example.com' })).toHaveAttribute(
      'href',
      'mailto:ana@example.com',
    );
    expect(screen.getByRole('link', { name: '+5491100000000' })).toHaveAttribute(
      'href',
      'tel:+5491100000000',
    );
  });

  it('skips missing contact data and an empty location', async () => {
    findUser.mockResolvedValue(
      profile({ phoneNumber: null, province: null, countryOfOrigin: null }),
    );
    jest.mocked(getCurrentSession).mockResolvedValue(sessionRow({ id: 'viewer' }));

    await renderPage(page());

    expect(screen.queryByText('teléfono')).not.toBeInTheDocument();
    expect(screen.queryByText('ubicación')).not.toBeInTheDocument();
    expect(screen.getByText('email')).toBeInTheDocument();
  });

  it('shows when the user joined the platform', async () => {
    findUser.mockResolvedValue(profile());
    jest.mocked(getCurrentSession).mockResolvedValue(null);

    await renderPage(page());

    expect(screen.getByText('miembro desde')).toBeInTheDocument();
    expect(screen.getByText('15 de marzo de 2024')).toBeInTheDocument();
  });

  it('lets the owner edit their profile', async () => {
    findUser.mockResolvedValue(profile());
    jest.mocked(getCurrentSession).mockResolvedValue(sessionRow({ id: 'p1' }));

    await renderPage(page());

    expect(screen.getByRole('link', { name: /editar perfil/ })).toHaveAttribute('href', '/perfil');
  });

  it('links admins back to /usuarios and lets them manage badges', async () => {
    findUser.mockResolvedValue(profile());
    jest.mocked(getCurrentSession).mockResolvedValue(adminRow());

    await renderPage(page());

    expect(screen.getByRole('link', { name: 'usuarios' })).toHaveAttribute('href', '/usuarios');
    expect(badgesProps().isAdmin).toBe(true);
  });

  it('links every social network the member has', async () => {
    findUser.mockResolvedValue(
      profile({
        xAccountUrl: 'https://x.com/ana',
        linkedinUrl: 'https://linkedin.com/in/ana',
        gitHubUrl: 'https://github.com/ana',
        instagramUrl: 'https://instagram.com/ana',
        youtubeUrl: 'https://youtube.com/@ana',
        twitchUrl: 'https://twitch.tv/ana',
        kickUrl: 'https://kick.com/ana',
      }),
    );

    await renderPage(page());

    const links = within(screen.getByRole('navigation', { name: 'Redes de Ana López' }))
      .getAllByRole('link')
      .map((link) => [link.getAttribute('title'), link.getAttribute('href')]);
    expect(links).toEqual([
      ['x', 'https://x.com/ana'],
      ['linkedin', 'https://linkedin.com/in/ana'],
      ['github', 'https://github.com/ana'],
      ['instagram', 'https://instagram.com/ana'],
      ['youtube', 'https://youtube.com/@ana'],
      ['twitch', 'https://twitch.tv/ana'],
      ['kick', 'https://kick.com/ana'],
    ]);
    expect(screen.getByRole('link', { name: /Perfil de X/ })).toHaveAttribute('target', '_blank');
    expect(jest.mocked(GitHubContributions).mock.calls[0][0]).toEqual({
      gitHubUrl: 'https://github.com/ana',
    });
  });

  it('shows the slogan, positions, studies and languages', async () => {
    findUser.mockResolvedValue(
      profile({
        slogan: 'Siempre aprendiendo',
        positions: [
          { jobTitle: 'Backend dev', enterprise: 'Acme' },
          { jobTitle: '', enterprise: 'Freelance' },
          { jobTitle: '', enterprise: null },
        ],
        career: 'Ingeniería en Sistemas',
        studyPlace: 'UTN',
        languages: [{ language: 'ts', color: '#3178c6', logo: '/ts.svg' }],
      }),
    );

    await renderPage(page());

    expect(screen.getByText('Siempre aprendiendo')).toBeInTheDocument();
    const work = screen.getByRole('heading', { name: /trabajo/ }).parentElement!;
    expect(within(work).getAllByRole('listitem')).toHaveLength(2);
    expect(within(work).getByText('Backend dev')).toBeInTheDocument();
    expect(within(work).getByText('Acme')).toBeInTheDocument();
    expect(within(work).getByText('Freelance')).toBeInTheDocument();
    expect(screen.getByText('Ingeniería en Sistemas')).toBeInTheDocument();
    expect(screen.getByText('UTN')).toBeInTheDocument();
    expect(jest.mocked(LanguageCoinsContainer).mock.calls[0][0]).toEqual({
      languages: [{ languageId: 'ts', color: '#3178c6', logo: '/ts.svg' }],
    });
  });

  it('falls back to the old single job title, and studies with only a place', async () => {
    findUser.mockResolvedValue(
      profile({ jobTitle: null, enterprise: 'Acme', studyPlace: 'UNT', career: null }),
    );

    await renderPage(page());

    const work = screen.getByRole('heading', { name: /trabajo/ }).parentElement!;
    expect(within(work).getByText('Acme')).toBeInTheDocument();
    expect(screen.getByText('UNT')).toBeInTheDocument();
  });

  it('orders badges: co-founder, ambassador, achievements, then custom ones', async () => {
    const achievement = {
      id: 'first-talk',
      name: 'Primera charla',
      description: '',
      icon: 'mic',
      tone: 'green',
    };
    jest.mocked(earnedAchievements).mockReturnValue([achievement] as never);
    const awardedAt = new Date('2025-05-05T00:00:00Z');
    findUser.mockResolvedValue(
      profile({
        isCofounder: true,
        isAmbassador: true,
        badges: [
          {
            awardedAt,
            badge: { id: 'b1', name: 'Mentor', description: 'Ayuda', icon: 'award', tone: 'gold' },
          },
          {
            awardedAt,
            badge: {
              id: 'b2',
              name: 'Raro',
              description: 'x',
              icon: 'no-such-icon',
              tone: 'no-such-tone',
            },
          },
        ],
      }),
    );

    await renderPage(page());

    expect(getUserAchievementMetrics).toHaveBeenCalledWith('p1');
    const { badges } = badgesProps();
    expect(badges.slice(0, 3)).toEqual([COFOUNDER_BADGE, AMBASSADOR_BADGE, achievement]);
    expect(badges[3]).toMatchObject({ id: 'b1', icon: 'award', custom: true, awardedAt });
    // Unknown icons and tones fall back to the defaults
    expect(badges[4]).toMatchObject({ id: 'b2', icon: 'award', tone: 'green', custom: true });
  });

  it('opens the requested tab and ignores unknown ones', async () => {
    findUser.mockResolvedValue(profile());

    await renderPage(page('charlas'));
    expect(tabProps().tab).toBe('charlas');
    expect(screen.getByText('pestaña charlas')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /charlas/, current: 'page' })).toHaveAttribute(
      'href',
      '/perfil/p1?tab=charlas',
    );

    jest.mocked(ProfileTabContent).mockClear();
    await renderPage(page('hackear'));
    expect(tabProps().tab).toBe('resumen');
  });

  it('shows only placeholders while loading', () => {
    expectOnlyPlaceholders(<Loading />);
  });
});

describe('/perfil/[id] link preview', () => {
  const card = () => jest.mocked(renderTerminalCard).mock.calls[0][0];

  it('only reads public fields of the profile', async () => {
    findUser.mockResolvedValue({ name: 'Ana López', image: null, slogan: null });

    await Image({ params: params() });

    expect(alt).toMatch(/Perfil/);
    expect(Object.keys(findUser.mock.calls[0][0].select).sort()).toEqual(
      ['career', 'enterprise', 'image', 'jobTitle', 'name', 'slogan', 'studyPlace'].sort(),
    );
  });

  it('draws the slogan with the job as extra meta, and the avatar', async () => {
    findUser.mockResolvedValue({
      name: 'ana maría lópez',
      image: 'https://img/ana.png',
      slogan: 'Siempre aprendiendo',
      jobTitle: 'Backend dev',
      enterprise: 'Acme',
      career: null,
      studyPlace: null,
    });

    await Image({ params: params() });

    expect(loadCardImage).toHaveBeenCalledWith('https://img/ana.png');
    expect(card()).toEqual({
      path: 'perfil',
      command: 'finger ana',
      title: 'ana maría lópez',
      description: 'Siempre aprendiendo',
      meta: ['miembro de PCN', 'Backend dev en Acme'],
      avatar: { src: 'data:avatar', initials: 'AM' },
    });
  });

  it.each([
    [{ jobTitle: 'Backend dev', enterprise: null }, 'Backend dev'],
    [{ career: 'Sistemas', studyPlace: 'UTN' }, 'Sistemas · UTN'],
    [{ career: 'Sistemas', studyPlace: null }, 'Sistemas'],
    [{}, 'Miembro de la comunidad programaConNosotros.'],
  ])('describes the member by job, studies or a default (%o)', async (fields, description) => {
    findUser.mockResolvedValue({
      name: 'Bruno',
      image: null,
      slogan: null,
      jobTitle: null,
      enterprise: null,
      career: null,
      studyPlace: null,
      ...fields,
    });

    await Image({ params: params() });

    expect(card()).toMatchObject({ description, meta: ['miembro de PCN'] });
    expect(card().avatar).toEqual({ src: 'data:avatar', initials: 'B' });
  });

  it('draws a generic card for a deleted user', async () => {
    findUser.mockResolvedValue(null);

    await Image({ params: params('gone') });

    expect(card()).toEqual({
      path: 'perfil',
      command: 'finger',
      title: 'Miembros de programaConNosotros',
      meta: ['500+ miembros'],
    });
    expect(loadCardImage).not.toHaveBeenCalled();
  });
});
