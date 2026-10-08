import { isValidElement, type ReactNode } from 'react';
import { render, screen, within } from '@testing-library/react';
import { AdviceCard } from '@/components/advice/advice-card';
import { ProfileArticles } from '@/components/profile/profile-articles';
import {
  ContributionStats,
  ConversationRows,
  OrganizedEvents,
  PhotoGrid,
  ProjectRows,
} from '@/components/profile/profile-sections';
import { ProfileTabCounts } from '@/components/profile/profile-tab-nav';
import { getAdminUser } from '@/lib/admin';
import { sessionRow } from '@/test/pages-m-z';
import * as data from './profile-data';
import { ProfileCountsLoader, ProfileTabContent } from './profile-tab-content';

jest.mock('./profile-data', () => ({
  getProfileAdvice: jest.fn(),
  getProfileArticles: jest.fn(),
  getProfileChangelog: jest.fn(),
  getProfileContributions: jest.fn(),
  getProfileConversations: jest.fn(),
  getProfileCounts: jest.fn(),
  getProfileEvents: jest.fn(),
  getProfileIdentities: jest.fn(),
  getProfilePhotos: jest.fn(),
  getProfileProjects: jest.fn(),
  getProfileSetups: jest.fn(),
  getProfileTalks: jest.fn(),
  getProfileVideos: jest.fn(),
  getProfileCourses: jest.fn(),
}));
jest.mock('@/lib/admin', () => ({ getAdminUser: jest.fn() }));
jest.mock('@/components/videos/video-grid', () => ({
  VideoGrid: ({ videos }: { videos: unknown[] }) => <p>{videos.length} videos</p>,
}));
jest.mock('@/components/setups/setup-tile', () => ({
  SetupTile: ({ setup }: { setup: { title: string } }) => <div>setup: {setup.title}</div>,
}));
jest.mock('@/components/advice/advice-card', () => ({
  AdviceCard: jest.fn(({ consejo }: { consejo: { id: string } }) => <p>consejo {consejo.id}</p>),
}));
jest.mock('@/components/profile/profile-articles', () => ({
  ProfileArticles: jest.fn(({ articles }: { articles: unknown[] }) => (
    <p>{articles.length} artículos</p>
  )),
}));
jest.mock('@/components/profile/profile-tab-nav', () => ({
  ...jest.requireActual('@/components/profile/profile-tab-nav'),
  ProfileTabCounts: jest.fn(() => null),
}));
jest.mock('@/components/profile/profile-sections', () => {
  const actual = jest.requireActual('@/components/profile/profile-sections');
  const rows = (name: string, key: string) =>
    jest.fn((props: Record<string, unknown[]>) => (
      <p>
        {props[key].length} {name}
      </p>
    ));
  return {
    ...actual,
    ProjectRows: rows('proyectos', 'projects'),
    OrganizedEvents: rows('eventos', 'events'),
    PhotoGrid: rows('fotos', 'photos'),
    ConversationRows: rows('conversaciones', 'conversations'),
    ContributionStats: rows('contribuidores', 'contributions'),
    ContributionChangelog: rows('cambios', 'entries'),
  };
});

const m = jest.mocked(data);
const list = (n: number, prefix: string) =>
  Array.from({ length: n }, (_, i) => ({ id: `${prefix}${i + 1}` }));

const talk = (overrides: Record<string, unknown> = {}) => ({
  id: 'talk-1',
  title: 'Testing en serio',
  portraitUrl: 'https://img/talk.jpg',
  videoUrl: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
  slidesUrl: null,
  slideImages: [],
  manualEventTitle: null,
  manualEventDate: null,
  manualEventLocation: null,
  speakers: [
    { id: 's1', speakerName: 'Ana', user: null },
    { id: 's2', speakerName: 'Bruno', user: null },
  ],
  event: {
    id: 'e1',
    name: 'Meetup',
    date: new Date('2025-06-10T22:00:00Z'),
    placeName: 'Hub',
    city: 'Tucumán',
    isOnline: false,
  },
  ...overrides,
});

const contributions = (count: number, linesAdded: number | null = 1500) => ({
  linked: count > 0,
  contributions: list(count, 'c'),
  totals: { mergedPrs: 100, commits: 1000 },
  mergedPrs: 7,
  commits: 1234,
  linesAdded,
});

const mockData = (sizes: Partial<Record<string, number>> = {}) => {
  m.getProfileProjects.mockResolvedValue(list(sizes.projects ?? 0, 'p') as never);
  m.getProfileAdvice.mockResolvedValue(list(sizes.advice ?? 0, 'a') as never);
  m.getProfileTalks.mockResolvedValue(
    Array.from({ length: sizes.talks ?? 0 }, (_, i) => talk({ id: `t${i + 1}` })) as never,
  );
  m.getProfileArticles.mockResolvedValue(list(sizes.articles ?? 0, 'r') as never);
  m.getProfileEvents.mockResolvedValue(list(sizes.events ?? 0, 'e') as never);
  m.getProfilePhotos.mockResolvedValue(list(sizes.photos ?? 0, 'f') as never);
  m.getProfileConversations.mockResolvedValue(list(sizes.conversations ?? 0, 'w') as never);
  m.getProfileVideos.mockResolvedValue(list(sizes.videos ?? 0, 'v') as never);
  m.getProfileCourses.mockResolvedValue(
    Array.from({ length: sizes.courses ?? 0 }, (_, i) => ({
      id: `c${i + 1}`,
      name: `Curso ${i + 1}`,
      description: 'Sobre algo',
      date: new Date('2020-06-27T00:00:00Z'),
      hours: 2,
      isMadeByCommunity: i === 0,
    })) as never,
  );
  m.getProfileSetups.mockResolvedValue(
    Array.from({ length: sizes.setups ?? 0 }, (_, i) => ({
      id: `s${i + 1}`,
      title: `Setup ${i + 1}`,
    })) as never,
  );
  m.getProfileContributions.mockResolvedValue(contributions(sizes.contributions ?? 0) as never);
  m.getProfileIdentities.mockResolvedValue({ whatsapp: [], github: [] } as never);
  jest.mocked(getAdminUser).mockResolvedValue(null);
  m.getProfileChangelog.mockResolvedValue(list(sizes.changelog ?? 0, 'ch') as never);
};

const person = { id: 'u1', name: 'Ana López', image: null };
const session = sessionRow({ id: 'viewer' });

/** Awaits the tab, and the async overview component it returns for `resumen`. */
const renderTab = async (tab: Parameters<typeof ProfileTabContent>[0]['tab']) => {
  let node: ReactNode = await ProfileTabContent({
    tab,
    userId: 'u1',
    firstName: 'Ana',
    session,
    person,
  });
  if (isValidElement(node) && typeof node.type === 'function') {
    node = await (node.type as (_props: unknown) => Promise<ReactNode>)(node.props);
  }
  return render(<>{node}</>);
};

const stat = (label: string) => screen.getByText(label, { selector: 'p' }).closest('a')!;
/** The `<section>` under the `# label` heading. */
const section = (label: string) =>
  screen
    .getAllByRole('heading', { level: 2 })
    .find((heading) => heading.textContent?.match(new RegExp(`^#${label}(\\(|ver|$)`)))!
    .parentElement!;

/** A talk's cell: cover, title, speakers, event and links. */
const talkCell = (title: string) => screen.getByText(title).closest('article')!;

describe('ProfileCountsLoader', () => {
  it('hands the counts to the tab bar', async () => {
    const counts = { proyectos: 2, consejos: 1 };
    m.getProfileCounts.mockResolvedValue(counts);

    render(await ProfileCountsLoader({ userId: 'u1' }));

    expect(m.getProfileCounts).toHaveBeenCalledWith('u1');
    expect(jest.mocked(ProfileTabCounts).mock.calls[0][0]).toEqual({ counts });
  });
});

describe('ProfileTabContent: resumen', () => {
  it('says when the member has no activity yet', async () => {
    mockData();
    await renderTab('resumen');

    expect(screen.getByText('Ana todavía no tiene actividad en la comunidad.')).toBeInTheDocument();
    expect(stat('proyectos')).toHaveAttribute('href', '/perfil/u1?tab=proyectos');
    expect(stat('proyectos')).toHaveTextContent('0');
    expect(screen.queryByText('PRs en pcn')).not.toBeInTheDocument();
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('previews each section and links to the full tab only when there is more', async () => {
    mockData({
      projects: 3,
      advice: 2,
      talks: 1,
      articles: 4,
      events: 2,
      photos: 7,
      conversations: 5,
    });
    await renderTab('resumen');

    expect(stat('consejos')).toHaveTextContent('2');
    expect(within(section('proyectos')).getByText('(3)')).toBeInTheDocument();
    expect(within(section('proyectos')).getByRole('link', { name: /ver todo/ })).toHaveAttribute(
      'href',
      '/perfil/u1?tab=proyectos',
    );
    expect(screen.getByText('2 proyectos')).toBeInTheDocument();
    expect(within(section('consejos')).queryByRole('link')).not.toBeInTheDocument();
    expect(jest.mocked(AdviceCard).mock.calls.map(([props]) => props.showAuthor)).toEqual([
      false,
      false,
    ]);
    expect(within(section('charlas')).queryByRole('link', { name: /ver todo/ })).toBeNull();
    expect(screen.getByText('3 artículos')).toBeInTheDocument();
    expect(jest.mocked(ProfileArticles).mock.calls[0][0].writer).toEqual(person);
    expect(within(section('eventos organizados')).queryByRole('link')).toBeNull();
    // 7 photos: two full rows of three
    expect(screen.getByText('6 fotos')).toBeInTheDocument();
    expect(
      within(section('fotos y videos')).getByRole('link', { name: /ver todo/ }),
    ).toBeInTheDocument();
    expect(screen.getByText('4 conversaciones')).toBeInTheDocument();
    expect(
      within(section('conversaciones')).getByRole('link', { name: /ver todo/ }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/todavía no tiene actividad/)).not.toBeInTheDocument();
  });

  it.each([
    [2, 2, false],
    [4, 3, true],
    [6, 6, false],
  ])('with %d photos previews %d (ver todo: %s)', async (total, shown, more) => {
    mockData({ photos: total });
    await renderTab('resumen');

    expect(screen.getByText(`${shown} fotos`)).toBeInTheDocument();
    expect(!!within(section('fotos y videos')).queryByRole('link', { name: /ver todo/ })).toBe(
      more,
    );
  });

  it('shows the PCN contributions only in their own section, not in the stats row', async () => {
    mockData({ contributions: 2 });
    await renderTab('resumen');

    expect(screen.queryByText('PRs en pcn')).not.toBeInTheDocument();
    expect(screen.queryByText('commits en pcn')).not.toBeInTheDocument();
    expect(screen.queryByText('líneas en pcn')).not.toBeInTheDocument();
    expect(screen.getByText('contribuciones a pcn')).toBeInTheDocument();
    expect(jest.mocked(ContributionStats).mock.calls[0][0].totals).toEqual({
      mergedPrs: 100,
      commits: 1000,
    });
  });

  it('shows each talk with its cover, whole title, speakers, event and place', async () => {
    mockData();
    const longTitle = 'Un título larguísimo que en /charlas se cortaría a las dos líneas';
    m.getProfileTalks.mockResolvedValue([
      talk({ title: longTitle }),
      talk({ id: 't2', title: 'Sin evento', portraitUrl: null, videoUrl: null, event: null }),
      talk({ id: 't3', title: 'Tercera' }),
      talk({ id: 't4', title: 'Cuarta' }),
    ] as never);
    const { container } = await renderTab('resumen');

    const talks = section('charlas');
    expect(within(talks).getByRole('link', { name: /ver todo/ })).toBeInTheDocument();
    expect(within(talks).getByText('(4)')).toBeInTheDocument();
    const first = talkCell(longTitle);
    expect(within(first).getByText(longTitle)).not.toHaveClass('line-clamp-2');
    expect(first.querySelector('img')).toHaveAttribute('src', 'https://img/talk.jpg');
    expect(within(first).getByRole('button', { name: /video/ })).toBeInTheDocument();
    expect(within(first).getByRole('link', { name: 'Meetup' })).toHaveAttribute(
      'href',
      '/eventos/e1',
    );
    expect(within(first).getByText('Hub, Tucumán')).toBeInTheDocument();
    // No #number: it's the talk's place on /charlas, unknown here.
    expect(within(first).queryByText(/^#\d{3}$/)).not.toBeInTheDocument();
    const second = talkCell('Sin evento');
    expect(second.querySelector('img')).not.toBeInTheDocument();
    expect(within(second).queryByRole('button', { name: /video/ })).not.toBeInTheDocument();
    // One full row in the preview
    expect(container.querySelectorAll('article')).toHaveLength(3);
  });
});

describe('ProfileTabContent: one section', () => {
  it.each([
    ['proyectos', 'projects', '3 proyectos', 'Ana todavía no participó en ningún proyecto.'],
    ['charlas', 'talks', 'Testing en serio', 'Ana todavía no dio ninguna charla.'],
    ['articulos', 'articles', '3 artículos', 'Ana todavía no publicó ningún artículo.'],
    ['eventos', 'events', '3 eventos', 'Ana todavía no organizó ningún evento.'],
  ] as const)('%s lists everything or says there is nothing', async (tab, key, full, empty) => {
    mockData({ [key]: 3 });
    const { unmount } = await renderTab(tab);
    expect(screen.getAllByText(full)[0]).toBeInTheDocument();
    unmount();

    mockData();
    await renderTab(tab);
    expect(screen.getByText(empty)).toBeInTheDocument();
  });

  it('consejos lists every consejo with the viewer session', async () => {
    mockData({ advice: 3 });
    await renderTab('consejos');

    expect(screen.getByText('consejo a3')).toBeInTheDocument();
    expect(jest.mocked(AdviceCard).mock.calls[0][0].session).toBe(session);
    expect(ProjectRows).not.toHaveBeenCalled();
  });

  it('consejos says when there are none', async () => {
    mockData();
    await renderTab('consejos');
    expect(screen.getByText('Ana todavía no compartió ningún consejo.')).toBeInTheDocument();
  });

  it('fotos shows the whole gallery or points to it', async () => {
    mockData({ photos: 8 });
    const { unmount } = await renderTab('fotos');
    expect(screen.getByText('8 fotos')).toBeInTheDocument();
    unmount();

    mockData();
    await renderTab('fotos');
    expect(screen.getByText(/no aparece en ninguna foto ni video/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'galería' })).toHaveAttribute('href', '/galeria');
    expect(PhotoGrid).toHaveBeenCalledTimes(1);
  });

  it('setups previews three in the overview and lists them all in their tab', async () => {
    mockData({ setups: 5 });
    const { unmount } = await renderTab('resumen');
    expect(screen.getAllByText(/^setup: /)).toHaveLength(3);
    expect(within(section('setups')).getByText('(5)')).toBeInTheDocument();
    expect(within(section('setups')).getByRole('link', { name: /ver todo/ })).toHaveAttribute(
      'href',
      '/perfil/u1?tab=setups',
    );
    unmount();

    mockData({ setups: 5 });
    const tab = await renderTab('setups');
    expect(screen.getAllByText(/^setup: /)).toHaveLength(5);
    tab.unmount();

    mockData();
    await renderTab('setups');
    expect(screen.getByText(/todavía no compartió su/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'setup' })).toHaveAttribute('href', '/setups');
  });

  it('cursos lists the courses the member taught with their date, or points to /cursos', async () => {
    mockData({ courses: 2 });
    const { unmount } = await renderTab('cursos');
    expect(screen.getByRole('link', { name: /Curso 1/ })).toHaveAttribute('href', '/cursos/c1');
    expect(screen.getAllByText(/27 de junio de 2020 · 2h/)).toHaveLength(2);
    unmount();

    mockData();
    await renderTab('cursos');
    expect(screen.getByText(/no dio ningún curso/)).toBeInTheDocument();
  });

  it('videos lists the videos the member is credited in, or points to /videos', async () => {
    mockData({ videos: 3 });
    const { unmount } = await renderTab('videos');
    expect(screen.getByText('3 videos')).toBeInTheDocument();
    unmount();

    mockData();
    await renderTab('videos');
    expect(screen.getByText(/no aparece en ningún video/)).toBeInTheDocument();
  });

  it('conversaciones distinguishes an unlinked profile from one without highlights', async () => {
    mockData({ conversations: 9 });
    const { unmount } = await renderTab('conversaciones');
    expect(screen.getByText('9 conversaciones')).toBeInTheDocument();
    expect(m.getProfileIdentities).toHaveBeenCalledWith('u1');
    unmount();

    mockData();
    const second = await renderTab('conversaciones');
    expect(
      screen.getByText('Todavía no vinculamos este perfil con el grupo de WhatsApp.'),
    ).toBeInTheDocument();
    second.unmount();

    m.getProfileIdentities.mockResolvedValue({ whatsapp: ['Ani'], github: [] } as never);
    await renderTab('conversaciones');
    expect(
      screen.getByText('Ana no aparece en las conversaciones destacadas.'),
    ).toBeInTheDocument();
    expect(ConversationRows).toHaveBeenCalledTimes(1);
  });

  it('contribuciones distinguishes an unlinked profile from a GitHub failure', async () => {
    mockData({ contributions: 2 });
    const { unmount } = await renderTab('contribuciones');
    expect(screen.getByText('2 contribuidores')).toBeInTheDocument();
    unmount();

    mockData();
    const second = await renderTab('contribuciones');
    expect(
      screen.getByText('Todavía no vinculamos a Ana con una cuenta que contribuyó al sitio.'),
    ).toBeInTheDocument();
    second.unmount();

    m.getProfileContributions.mockResolvedValue({ ...contributions(0), linked: true } as never);
    await renderTab('contribuciones');
    expect(
      screen.getByText('No pudimos traer las contribuciones de GitHub, probá más tarde.'),
    ).toBeInTheDocument();
    expect(OrganizedEvents).not.toHaveBeenCalled();
  });

  it('contribuciones lists what they built from the changelog, admin-only entries for admins', async () => {
    mockData({ contributions: 1, changelog: 3 });
    jest.mocked(getAdminUser).mockResolvedValue({ id: 'admin' } as never);
    await renderTab('contribuciones');

    expect(screen.getByText('3 cambios')).toBeInTheDocument();
    expect(m.getProfileChangelog).toHaveBeenCalledWith(expect.any(String), true);
  });
});
