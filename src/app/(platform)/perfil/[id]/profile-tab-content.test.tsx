import { isValidElement, type ReactNode } from 'react';
import { render, screen, within } from '@testing-library/react';
import { AdviseCard } from '@/components/advises/advise-card';
import { ProfileArticles } from '@/components/profile/profile-articles';
import {
  ContributionStats,
  ConversationRows,
  OrganizedEventRows,
  PhotoGrid,
  ProjectRows,
} from '@/components/profile/profile-sections';
import { ProfileTabCounts } from '@/components/profile/profile-tab-nav';
import { sessionRow } from '@/test/pages-m-z';
import * as data from './profile-data';
import { ProfileCountsLoader, ProfileTabContent } from './profile-tab-content';

jest.mock('./profile-data', () => ({
  getProfileAdvises: jest.fn(),
  getProfileArticles: jest.fn(),
  getProfileContributions: jest.fn(),
  getProfileConversations: jest.fn(),
  getProfileCounts: jest.fn(),
  getProfileEvents: jest.fn(),
  getProfileIdentities: jest.fn(),
  getProfilePhotos: jest.fn(),
  getProfileProjects: jest.fn(),
  getProfileTalks: jest.fn(),
}));
jest.mock('@/components/advises/advise-card', () => ({
  AdviseCard: jest.fn(({ consejo }: { consejo: { id: string } }) => <p>consejo {consejo.id}</p>),
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
    OrganizedEventRows: rows('eventos', 'events'),
    PhotoGrid: rows('fotos', 'photos'),
    ConversationRows: rows('conversaciones', 'conversations'),
    ContributionStats: rows('contribuidores', 'contributions'),
  };
});

const m = jest.mocked(data);
const list = (n: number, prefix: string) =>
  Array.from({ length: n }, (_, i) => ({ id: `${prefix}${i + 1}` }));

const talk = (overrides: Record<string, unknown> = {}) => ({
  id: 'talk-1',
  title: 'Testing en serio',
  portraitUrl: 'https://img/talk.jpg',
  videoUrl: 'https://youtube.com/watch?v=1',
  speakers: [{ speakerName: 'Ana' }, { speakerName: 'Bruno' }],
  event: { date: new Date('2025-06-10T22:00:00Z'), placeName: 'Hub', city: 'Tucumán' },
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
  m.getProfileAdvises.mockResolvedValue(list(sizes.advises ?? 0, 'a') as never);
  m.getProfileTalks.mockResolvedValue(
    Array.from({ length: sizes.talks ?? 0 }, (_, i) => talk({ id: `t${i + 1}` })) as never,
  );
  m.getProfileArticles.mockResolvedValue(list(sizes.articles ?? 0, 'r') as never);
  m.getProfileEvents.mockResolvedValue(list(sizes.events ?? 0, 'e') as never);
  m.getProfilePhotos.mockResolvedValue(list(sizes.photos ?? 0, 'f') as never);
  m.getProfileConversations.mockResolvedValue(list(sizes.conversations ?? 0, 'w') as never);
  m.getProfileContributions.mockResolvedValue(contributions(sizes.contributions ?? 0) as never);
  m.getProfileIdentities.mockResolvedValue({ whatsapp: [], github: [] } as never);
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

/** A talk's row: photo, title line, speakers and meta. */
const talkCell = (title: string) =>
  screen.getByRole('heading', { name: title }).parentElement!.parentElement!.parentElement!;

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
      advises: 2,
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
    expect(jest.mocked(AdviseCard).mock.calls.map(([props]) => props.showAuthor)).toEqual([
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

  it('adds the GitHub contribution stats when the member contributed to the site', async () => {
    mockData({ contributions: 2 });
    await renderTab('resumen');

    expect(stat('PRs en pcn')).toHaveTextContent('7');
    expect(stat('commits en pcn')).toHaveTextContent((1234).toLocaleString('es-AR'));
    expect(stat('líneas en pcn')).toHaveTextContent((1500).toLocaleString('es-AR'));
    expect(stat('líneas en pcn')).toHaveAttribute('href', '/perfil/u1?tab=contribuciones');
    expect(jest.mocked(ContributionStats).mock.calls[0][0].totals).toEqual({
      mergedPrs: 100,
      commits: 1000,
    });
  });

  it('shows a dash when GitHub never had the line stats ready', async () => {
    mockData();
    m.getProfileContributions.mockResolvedValue(contributions(1, null) as never);
    await renderTab('resumen');

    expect(stat('líneas en pcn')).toHaveTextContent('—');
  });

  it('shows each talk with its speakers, video, date and place', async () => {
    mockData();
    m.getProfileTalks.mockResolvedValue([
      talk(),
      talk({ id: 't2', title: 'Sin evento', portraitUrl: null, videoUrl: null, event: null }),
      talk({ id: 't3' }),
    ] as never);
    await renderTab('resumen');

    const talks = section('charlas');
    expect(within(talks).getByRole('link', { name: /ver todo/ })).toBeInTheDocument();
    expect(within(talks).getByText('(3)')).toBeInTheDocument();
    const first = talkCell('Testing en serio');
    expect(within(first).getByRole('img')).toHaveAttribute('src', 'https://img/talk.jpg');
    expect(within(first).getByRole('link', { name: /youtube/ })).toHaveAttribute(
      'href',
      'https://youtube.com/watch?v=1',
    );
    expect(within(first).getByText('Ana, Bruno')).toBeInTheDocument();
    expect(within(first).getByText(/Hub, Tucumán/)).toBeInTheDocument();
    const second = talkCell('Sin evento');
    expect(within(second).queryByRole('img')).not.toBeInTheDocument();
    expect(within(second).queryByRole('link')).not.toBeInTheDocument();
    expect(within(second).queryByText('@')).not.toBeInTheDocument();
    // Only two talks in the preview
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(2);
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
    mockData({ advises: 3 });
    await renderTab('consejos');

    expect(screen.getByText('consejo a3')).toBeInTheDocument();
    expect(jest.mocked(AdviseCard).mock.calls[0][0].session).toBe(session);
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
    expect(OrganizedEventRows).not.toHaveBeenCalled();
  });
});
