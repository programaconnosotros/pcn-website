import { screen } from '@testing-library/react';
import { requireAdminPage } from '@/lib/admin';
import { getCollaborationStats } from '@/lib/github-stats';
import { getIdentityMap } from '@/lib/identity-links';
import { renderPage, thrownBy } from '@/test/pages-m-z';
import { IdentityLinksTable } from './identity-links-table';
import VinculosPage, { metadata } from './page';

jest.mock('@/lib/admin', () => ({ requireAdminPage: jest.fn() }));
jest.mock('@/lib/github-stats', () => ({ getCollaborationStats: jest.fn() }));
jest.mock('@/lib/identity-links', () => ({ getIdentityMap: jest.fn() }));
jest.mock('./identity-links-table', () => ({
  IdentityLinksTable: jest.fn(({ title }: { title: string }) => <h2>{title}</h2>),
}));
jest.mock('@/data/whatsapp-conversations', () => ({
  conversations: [
    { participants: ['Bea', 'Ana'] },
    { participants: ['Bea'] },
    { participants: ['Ana'] },
    { participants: ['Ana'] },
  ],
}));
jest.mock('@/data/whatsapp-conversations/members', () => ({
  members: [{ name: 'Ana' }, { name: 'Bea' }, { name: 'Ceci' }, { name: 'Abel' }],
}));
jest.mock('@/app/(platform)/lectura/articles', () => ({
  articles: [
    { author: 'Zoe' },
    { author: 'Zoe', coauthors: ['Ana'] },
    { author: 'Ana' },
    { author: 'Leo' },
  ],
  articleAuthors: (article: { author: string; coauthors?: string[] }) => [
    article.author,
    ...(article.coauthors ?? []),
  ],
}));
jest.mock('@/components/historia/people', () => ({ HISTORIA_PEOPLE: ['Zoe', 'Abel'] }));
jest.mock('@/components/videos/videos', () => ({
  videos: [{ speaker: 'Ana (Acme) y Leo' }, { speaker: 'Ana' }, { speaker: undefined }],
  videoSpeakers: (video: { speaker?: string }) =>
    video.speaker ? video.speaker.replace(/ \(.*?\)/, '').split(' y ') : [],
}));

const ana = { id: 'u-ana', name: 'Ana', image: null };
const links: Record<string, Record<string, typeof ana>> = {
  whatsapp: { Ana: ana },
  github: { 'ana-dev': ana, 'old-login': { id: 'u-old', name: 'Old', image: null } },
  articulos: { Zoe: { id: 'u-zoe', name: 'Zoe', image: null } },
  historia: {},
  videos: { Leo: { id: 'u-leo', name: 'Leo', image: null } },
};

const contributor = (login: string, mergedPrs: number) => ({
  login,
  avatarUrl: `https://avatars/${login}`,
  mergedPrs,
  commits: mergedPrs * 3,
});

const tableProps = (source: string) =>
  jest.mocked(IdentityLinksTable).mock.calls.find(([props]) => props.source === source)![0];

describe('/vinculos', () => {
  beforeEach(() => {
    jest.mocked(getIdentityMap).mockImplementation(async (source) => links[source]);
    jest.mocked(getCollaborationStats).mockResolvedValue({
      topContributors: [contributor('ana-dev', 9), contributor('bot', 1)],
    } as never);
  });

  it('is an admin page kept out of search engines', () => {
    expect(metadata).toMatchObject({
      title: 'sudo ls ~/vinculos',
      robots: { index: false, follow: false },
    });
  });

  it('only lets admins in', async () => {
    jest.mocked(requireAdminPage).mockRejectedValueOnce(new Error('NEXT_REDIRECT:/'));
    expect(await thrownBy(() => VinculosPage())).toBe('NEXT_REDIRECT:/');
    expect(getIdentityMap).not.toHaveBeenCalled();
  });

  it('ranks WhatsApp members by conversations, then by name', async () => {
    await renderPage(VinculosPage());

    expect(tableProps('whatsapp').rows).toEqual([
      { externalName: 'Ana', detail: '3 conversaciones', weight: 3, user: ana },
      { externalName: 'Bea', detail: '2 conversaciones', weight: 2, user: null },
      { externalName: 'Abel', detail: '0 conversaciones', weight: 0, user: null },
      { externalName: 'Ceci', detail: '0 conversaciones', weight: 0, user: null },
    ]);
  });

  it('lists GitHub contributors plus linked logins GitHub no longer lists', async () => {
    await renderPage(VinculosPage());

    const { rows, emptyMessage } = tableProps('github');
    expect(rows).toEqual([
      {
        externalName: 'ana-dev',
        detail: '9 PRs · 27 commits',
        weight: 9,
        avatarUrl: 'https://avatars/ana-dev',
        user: ana,
      },
      {
        externalName: 'bot',
        detail: '1 PRs · 3 commits',
        weight: 1,
        avatarUrl: 'https://avatars/bot',
        user: null,
      },
      { externalName: 'old-login', detail: '—', weight: 0, user: links.github['old-login'] },
    ]);
    expect(emptyMessage).toBe('sin contribuidores');
  });

  it('says when GitHub could not be reached', async () => {
    jest.mocked(getCollaborationStats).mockResolvedValue(null as never);
    await renderPage(VinculosPage());

    const { rows, emptyMessage } = tableProps('github');
    expect(rows.map((row) => row.externalName)).toEqual(['ana-dev', 'old-login']);
    expect(emptyMessage).toBe('no pudimos conectarnos con GitHub, probá más tarde');
  });

  it('counts articles per author, coauthors included', async () => {
    await renderPage(VinculosPage());

    expect(tableProps('articulos').rows).toEqual([
      { externalName: 'Ana', detail: '2 artículos', weight: 2, user: null },
      { externalName: 'Zoe', detail: '2 artículos', weight: 2, user: links.articulos.Zoe },
      { externalName: 'Leo', detail: '1 artículo', weight: 1, user: null },
    ]);
  });

  it('keeps the story people in order and sums up what is linked', async () => {
    await renderPage(VinculosPage());

    expect(tableProps('historia').rows.map((row) => row.externalName)).toEqual(['Zoe', 'Abel']);
    expect(
      screen.getByText(
        '1/4 de whatsapp · 2/3 de github · 1/3 de artículos · 0/2 de historia · 1/2 de videos',
      ),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual([
      'whatsapp',
      'github',
      'artículos',
      'historia',
      'videos',
    ]);
  });

  it('counts the videos of each credited speaker', async () => {
    await renderPage(VinculosPage());
    expect(
      tableProps('videos').rows.map((row) => [row.externalName, row.detail, row.user?.id ?? null]),
    ).toEqual([
      ['Ana', '2 videos', null],
      ['Leo', '1 video', 'u-leo'],
    ]);
  });
});
