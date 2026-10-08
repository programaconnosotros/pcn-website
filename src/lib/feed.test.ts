import { prismaMock } from '@/test/prisma';
import { conversationHref } from '@/components/conversations/conversation-utils';
import type { Conversation } from '@/data/whatsapp-conversations';
import type { ChangelogEntry } from '@/data/changelog';
import { getEventNames } from '@/lib/event-index';
import { fetchFeed, toFeedDay } from './feed';

const mockConversations: Conversation[] = [];
const mockChangelog: ChangelogEntry[] = [];

jest.mock('@/data/whatsapp-conversations', () => ({
  get conversations() {
    return mockConversations;
  },
}));
jest.mock('@/data/changelog', () => ({
  get changelog() {
    return mockChangelog;
  },
}));
jest.mock('@/lib/event-index', () => ({ getEventNames: jest.fn() }));
jest.mock('@/lib/identity-links', () => ({ getIdentityMap: jest.fn(async () => ({})) }));
const mockContributors: unknown[] = [];
jest.mock('@/lib/github-stats', () => ({
  getCollaborationStats: async () => ({ topContributors: mockContributors }),
}));
jest.mock('@/lib/gallery-signing', () => ({
  signGallerySrc: (src: string) => ({ url: `signed:${src}` }),
}));

const at = (iso: string) => new Date(iso);

const emptySources = () => {
  prismaMock.event.findMany.mockResolvedValue([]);
  prismaMock.talk.findMany.mockResolvedValue([]);
  prismaMock.galleryItem.findMany.mockResolvedValue([]);
  prismaMock.setup.findMany.mockResolvedValue([]);
  prismaMock.project.findMany.mockResolvedValue([]);
};

beforeEach(() => {
  mockContributors.length = 0;
  mockConversations.length = 0;
  mockChangelog.length = 0;
  jest.mocked(getEventNames).mockResolvedValue({});
  emptySources();
});

describe('toFeedDay', () => {
  it("counts days in Argentina's time zone", () => {
    // 01:00 UTC is still the previous evening in Buenos Aires.
    expect(toFeedDay(at('2026-05-02T01:00:00Z'))).toBe('2026-05-01');
    expect(toFeedDay(at('2026-05-02T04:00:00Z'))).toBe('2026-05-02');
  });
});

describe('fetchFeed', () => {
  it("announces each developer's first merged PR, linked to their profile when linked", async () => {
    const { getIdentityMap } = jest.requireMock('@/lib/identity-links');
    getIdentityMap.mockResolvedValueOnce({ ada: { id: 'u1', name: 'Ada Lovelace', image: null } });
    mockContributors.push(
      {
        login: 'ada',
        commits: 9,
        mergedPrs: 2,
        firstContributionWeek: '2025-01-05T00:00:00Z',
        pulls: [
          { number: 9, title: 'feat: b', mergedAt: '2025-03-01T15:00:00Z' },
          { number: 3, title: 'fix(ui): botón roto', mergedAt: '2025-02-01T15:00:00Z' },
        ],
      },
      { login: 'old', commits: 4, mergedPrs: 0, firstContributionWeek: '2024-06-16T00:00:00Z' },
    );

    const items = await fetchFeed();
    expect(items).toEqual([
      expect.objectContaining({
        id: 'desarrollo-ada',
        kind: 'desarrollo',
        day: '2025-02-01',
        title: 'Ada Lovelace hizo su primera contribución al sitio',
        description: 'Su primera PR: “Botón roto”. Ya suma 2 PRs mergeadas.',
        href: '/perfil/u1?tab=contribuciones',
      }),
      expect.objectContaining({
        id: 'desarrollo-old',
        title: 'old hizo su primera contribución al sitio',
        href: '/desarrollo#team',
      }),
    ]);
  });

  it('is empty when nothing happened', async () => {
    expect(await fetchFeed()).toEqual([]);
  });

  it('announces events created on or before their date, skipping backfilled ones', async () => {
    prismaMock.event.findMany.mockResolvedValue([
      {
        id: 'e1',
        name: 'Meetup',
        date: at('2026-06-10T22:00:00Z'),
        isOnline: false,
        createdAt: at('2026-06-01T15:00:00Z'),
      },
      {
        id: 'e2',
        name: 'Online talk',
        date: at('2026-06-20T22:00:00Z'),
        isOnline: true,
        createdAt: at('2026-06-20T12:00:00Z'),
      },
      {
        id: 'old',
        name: 'Backfilled',
        date: at('2024-01-01T22:00:00Z'),
        isOnline: false,
        createdAt: at('2026-06-05T12:00:00Z'),
      },
    ] as never);
    const feed = await fetchFeed();
    expect(feed.map((item) => item.id)).toEqual(['evento-e2', 'evento-e1']);
    expect(feed[0]).toMatchObject({
      kind: 'evento',
      day: '2026-06-20',
      href: '/eventos/e2',
      description: 'Nuevo evento online para el 2026-06-20. Sumate.',
    });
    expect(feed[1].description).toBe('Nuevo evento para el 2026-06-10. Sumate.');
  });

  it('lists talks with their speakers and whether the recording is out', async () => {
    prismaMock.talk.findMany.mockResolvedValue([
      {
        id: 't1',
        title: 'Testing',
        createdAt: at('2026-06-02T15:00:00Z'),
        videoUrl: 'https://youtu.be/x',
        speakers: [{ speakerName: 'Ana' }, { speakerName: 'Beto' }],
      },
      {
        id: 't2',
        title: 'No speakers',
        createdAt: at('2026-06-01T15:00:00Z'),
        videoUrl: null,
        speakers: [],
      },
    ] as never);
    const [withVideo, plain] = await fetchFeed();
    expect(withVideo).toMatchObject({
      id: 'charla-t1',
      kind: 'charla',
      meta: 'Ana, Beto',
      description: 'Ya está la grabación disponible.',
      href: '/charlas',
    });
    expect(plain.meta).toBeUndefined();
    expect(plain.description).toBeUndefined();
  });

  it('groups gallery uploads by day and event and signs their thumbnails', async () => {
    const photo = (id: string, createdAt: string, event?: { id: string; name: string }) => ({
      id,
      kind: 'PHOTO',
      src: `full/${id}`,
      thumbSrc: `thumb/${id}`,
      createdAt: at(createdAt),
      event: event ?? null,
    });
    const meetup = { id: 'e1', name: 'Meetup' };
    prismaMock.galleryItem.findMany.mockResolvedValue([
      photo('p1', '2026-06-03T20:00:00Z', meetup),
      photo('p2', '2026-06-03T19:00:00Z', meetup),
      { ...photo('v1', '2026-06-03T18:00:00Z', meetup), kind: 'VIDEO' },
      photo('p3', '2026-06-03T17:00:00Z', meetup),
      photo('p4', '2026-06-03T16:00:00Z', meetup),
      photo('solo', '2026-06-02T16:00:00Z'),
      { ...photo('v2', '2026-06-01T16:00:00Z'), kind: 'VIDEO' },
      { ...photo('v3', '2026-06-01T15:00:00Z'), kind: 'VIDEO' },
    ] as never);
    const feed = await fetchFeed();
    expect(prismaMock.galleryItem.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { legacyId: null }, take: 120 }),
    );
    expect(feed).toHaveLength(3);
    expect(feed[0]).toMatchObject({
      id: 'fotos-p1',
      kind: 'fotos',
      title: 'Meetup',
      meta: '4 fotos y 1 video',
      href: '/galeria?evento=e1',
    });
    expect(feed[0].thumbs).toEqual([
      { id: 'p1', src: 'signed:thumb/p1' },
      { id: 'p2', src: 'signed:thumb/p2' },
      { id: 'v1', src: 'signed:thumb/v1' },
      { id: 'p3', src: 'signed:thumb/p3' },
    ]);
    expect(feed[1]).toMatchObject({
      title: 'Nuevos recuerdos en la galería',
      meta: '1 foto',
      href: '/galeria/solo',
    });
    expect(feed[2]).toMatchObject({ meta: '2 videos', href: '/galeria' });
  });

  it('keeps at most six photo batches', async () => {
    prismaMock.galleryItem.findMany.mockResolvedValue(
      Array.from({ length: 8 }, (_, day) => ({
        id: `p${day}`,
        kind: 'PHOTO',
        src: 's',
        thumbSrc: 't',
        createdAt: at(`2026-06-1${day}T15:00:00Z`),
        event: null,
      })) as never,
    );
    expect(await fetchFeed()).toHaveLength(6);
  });

  it('lists setups with their thumbnail and projects with their author', async () => {
    prismaMock.setup.findMany.mockResolvedValue([
      {
        id: 's1',
        title: 'My desk',
        description: 'Two monitors',
        thumbUrl: 'thumb/s1',
        createdAt: at('2026-06-05T15:00:00Z'),
        author: { name: 'Ana' },
      },
    ] as never);
    prismaMock.project.findMany.mockResolvedValue([
      {
        id: 'pr1',
        title: 'CLI',
        description: 'A tool',
        createdAt: at('2026-06-04T15:00:00Z'),
        author: { name: 'Beto' },
      },
      {
        id: 'pr2',
        title: 'Orphan',
        description: 'No author',
        createdAt: at('2026-06-03T15:00:00Z'),
        author: null,
      },
    ] as never);
    const [setup, project, orphan] = await fetchFeed();
    expect(setup).toMatchObject({
      id: 'setup-s1',
      kind: 'setup',
      meta: 'Ana',
      href: '/setups/s1',
      thumbs: [{ id: 's1', src: 'signed:thumb/s1' }],
    });
    expect(project).toMatchObject({ id: 'proyecto-pr1', meta: 'Beto', href: '/proyectos/pr1' });
    expect(project.thumbs).toBeUndefined();
    expect(orphan.meta).toBeUndefined();
  });

  it('lists the latest conversations, tagging the ones summarized from an event', async () => {
    mockConversations.push(
      { title: 'Chat', date: '2026-06-01', summary: 'Hablamos.', participants: [] },
      {
        title: 'Meetup chat',
        date: '2026-06-02',
        summary: 'En el meetup.',
        eventId: 'e1',
        participants: [],
      },
    );
    jest.mocked(getEventNames).mockResolvedValue({ e1: 'Meetup' });
    const [fromEvent, fromChat] = await fetchFeed();
    expect(getEventNames).toHaveBeenCalledWith(['e1']);
    expect(fromEvent).toMatchObject({
      kind: 'conversacion',
      day: '2026-06-02',
      tag: 'evento',
      meta: 'Meetup',
      href: conversationHref(mockConversations[1]),
    });
    expect(fromChat.tag).toBeUndefined();
    expect(fromChat.id).toBe(`conversacion-${conversationHref(mockConversations[0])}`);
  });

  it('includes changelog entries for everyone but not admin-only ones', async () => {
    mockChangelog.push(
      { date: '2026-06-01', area: 'ui', title: 'Public', description: 'd', authors: [] },
      {
        date: '2026-06-02',
        area: 'admin',
        title: 'Admins',
        description: 'd',
        authors: [],
        audience: 'admins',
      },
      {
        date: '2026-05-01',
        area: 'eventos',
        title: 'Linked',
        description: 'd',
        authors: [],
        href: '/eventos',
      },
    );
    const feed = await fetchFeed();
    expect(feed.map((item) => item.title)).toEqual(['Public', 'Linked']);
    expect(feed[0]).toMatchObject({ kind: 'changelog', meta: 'ui', href: '/changelog' });
    expect(feed[1].href).toBe('/eventos');
  });

  it('orders by day, then by time within the day, and caps the feed at 60 items', async () => {
    prismaMock.talk.findMany.mockResolvedValue([
      {
        id: 'late',
        title: 'Late',
        createdAt: at('2026-06-01T22:00:00Z'),
        videoUrl: null,
        speakers: [],
      },
      {
        id: 'early',
        title: 'Early',
        createdAt: at('2026-06-01T12:00:00Z'),
        videoUrl: null,
        speakers: [],
      },
    ] as never);
    mockChangelog.push({
      date: '2026-06-01',
      area: 'ui',
      title: 'Same day',
      description: 'd',
      authors: [],
    });
    const feed = await fetchFeed();
    expect(feed.map((item) => item.title)).toEqual(['Late', 'Early', 'Same day']);

    for (let i = 0; i < 40; i++)
      mockConversations.push({
        title: `c${i}`,
        date: `2026-0${(i % 9) + 1}-10`,
        summary: '',
        participants: [],
      });
    for (let i = 0; i < 40; i++)
      mockChangelog.push({
        date: '2025-01-01',
        area: 'ui',
        title: `l${i}`,
        description: '',
        authors: [],
      });
    prismaMock.project.findMany.mockResolvedValue(
      Array.from({ length: 15 }, (_, i) => ({
        id: `p${i}`,
        title: `p${i}`,
        description: '',
        createdAt: at('2026-01-01T15:00:00Z'),
        author: null,
      })) as never,
    );
    prismaMock.setup.findMany.mockResolvedValue(
      Array.from({ length: 15 }, (_, i) => ({
        id: `s${i}`,
        title: `s${i}`,
        description: '',
        thumbUrl: 't',
        createdAt: at('2026-01-02T15:00:00Z'),
        author: { name: 'Ana' },
      })) as never,
    );
    // 15 conversations + 15 changelog entries + 15 projects + 15 setups + 2 talks.
    expect(await fetchFeed()).toHaveLength(60);
  });
});
