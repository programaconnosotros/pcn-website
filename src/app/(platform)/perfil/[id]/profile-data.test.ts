import { prismaMock } from '@/test/prisma';
import { articles } from '@/app/(platform)/lectura/articles';
import { conversations } from '@/data/whatsapp-conversations';
import { extractedConsejos } from '@/data/consejos-extraidos';
import { getCollaborationStats } from '@/lib/github-stats';
import { getUserIdentities } from '@/lib/identity-links';
import {
  getProfileAdvice,
  getProfileArticles,
  getProfileContributions,
  getProfileConversations,
  getProfileCounts,
  getProfileEvents,
  getProfilePhotos,
  getProfileProjects,
  getProfileTalks,
} from './profile-data';

jest.mock('@/lib/identity-links', () => ({ getUserIdentities: jest.fn() }));
jest.mock('@/lib/consejos-server', () => ({ listExtractedActivity: jest.fn(async () => ({})) }));
jest.mock('@/lib/github-stats', () => ({ getCollaborationStats: jest.fn() }));
jest.mock('@/lib/gallery-signing', () => ({
  signGalleryItem: (item: { src: string; thumbSrc: string }) => ({
    ...item,
    src: `${item.src}?signed`,
    thumbSrc: `${item.thumbSrc}?signed`,
  }),
}));

const mockIdentities = getUserIdentities as jest.Mock;
const mockStats = getCollaborationStats as jest.Mock;
const noIdentities = { whatsapp: [], github: [], articulos: [] };
const user = { id: 'u1', name: 'Ana', image: null };

beforeEach(() => {
  mockIdentities.mockResolvedValue(noIdentities);
});

describe('getProfileAdvice', () => {
  it('merges published consejos with the extracted ones under linked WhatsApp names, newest first', async () => {
    const extracted = extractedConsejos[0];
    mockIdentities.mockResolvedValue({ ...noIdentities, whatsapp: [extracted.member] });
    prismaMock.user.findUnique.mockResolvedValue(user as any);
    prismaMock.advice.findMany.mockResolvedValue([
      {
        id: 'adv-old',
        content: 'Viejo',
        createdAt: new Date('2000-01-01T00:00:00Z'),
        author: user,
        likes: [],
        _count: { comments: 0 },
      },
      {
        id: 'adv-new',
        content: 'Nuevo',
        createdAt: new Date('2999-01-01T00:00:00Z'),
        author: user,
        likes: [],
        _count: { comments: 2 },
      },
    ] as any);

    const advice = await getProfileAdvice('u1');

    expect(advice[0].id).toBe('adv-new');
    expect(advice.at(-1)!.id).toBe('adv-old');
    const fromChat = advice.filter((advice) => advice.source !== null);
    expect(fromChat.map((advice) => advice.id)).toContain(extracted.id);
    expect(fromChat.every((advice) => advice.author.id === 'u1')).toBe(true);
    expect(prismaMock.advice.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { authorId: 'u1' } }),
    );
  });

  it('skips extracted consejos when the user no longer exists', async () => {
    mockIdentities.mockResolvedValue({ ...noIdentities, whatsapp: [extractedConsejos[0].member] });
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.advice.findMany.mockResolvedValue([]);

    await expect(getProfileAdvice('gone')).resolves.toEqual([]);
  });
});

describe('getProfileTalks / getProfileEvents', () => {
  it('lists the talks the user gave', async () => {
    prismaMock.talk.findMany.mockResolvedValue([{ id: 't1' }] as any);
    await expect(getProfileTalks('u1')).resolves.toEqual([{ id: 't1' }]);
    expect(prismaMock.talk.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { speakers: { some: { userId: 'u1' } } } }),
    );
  });

  it('puts the newest talks first, by event date or the one typed in, undated last', async () => {
    prismaMock.talk.findMany.mockResolvedValue([
      { id: 'undated', event: null, manualEventDate: null },
      { id: 'old', event: { date: new Date('2023-01-01') }, manualEventDate: null },
      { id: 'manual', event: null, manualEventDate: new Date('2025-01-01') },
      { id: 'new', event: { date: new Date('2026-01-01') }, manualEventDate: null },
    ] as any);
    const talks = await getProfileTalks('u1');
    expect(talks.map((talk) => talk.id)).toEqual(['new', 'manual', 'old', 'undated']);
  });

  it('lists the events the user organized that were not deleted', async () => {
    prismaMock.event.findMany.mockResolvedValue([{ id: 'e1' }] as any);
    await expect(getProfileEvents('u1')).resolves.toEqual([{ id: 'e1' }]);
    expect(prismaMock.event.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { deletedAt: null, organizers: { some: { userId: 'u1' } } },
      }),
    );
  });
});

describe('getProfileProjects', () => {
  it('labels each project with the role loaded, or as author or collaborator', async () => {
    const base = { title: 'P', description: 'd', logoUrl: null, techStack: [] };
    prismaMock.project.findMany.mockResolvedValue([
      { ...base, id: 'p1', authorId: 'u1', authorRole: 'Backend', members: [] },
      { ...base, id: 'p2', authorId: 'u1', authorRole: null, members: [] },
      { ...base, id: 'p3', authorId: 'x', authorRole: 'Lead', members: [{ role: 'QA' }] },
      { ...base, id: 'p4', authorId: 'x', authorRole: null, members: [{ role: null }] },
      { ...base, id: 'p5', authorId: 'x', authorRole: null, members: [] },
    ] as any);

    const projects = await getProfileProjects('u1');

    expect(projects.map((project) => [project.id, project.role])).toEqual([
      ['p1', 'Backend'],
      ['p2', 'autor'],
      ['p3', 'QA'],
      ['p4', 'colaborador'],
      ['p5', 'colaborador'],
    ]);
    expect(projects[0]).not.toHaveProperty('members');
    expect(projects[0]).not.toHaveProperty('authorRole');
  });
});

describe('getProfilePhotos', () => {
  it('signs the cached photos the user is tagged in', async () => {
    prismaMock.galleryItem.findMany.mockResolvedValue([
      {
        id: 'g1',
        kind: 'PHOTO',
        description: null,
        src: 'https://cdn/a.jpg',
        thumbSrc: 'https://cdn/a-t.jpg',
      },
    ] as any);

    await expect(getProfilePhotos('u1')).resolves.toEqual([
      {
        id: 'g1',
        kind: 'PHOTO',
        description: null,
        src: 'https://cdn/a.jpg?signed',
        thumbSrc: 'https://cdn/a-t.jpg?signed',
      },
    ]);
  });
});

describe('getProfileArticles', () => {
  it('lists articles tagged on the user or written under a linked author name, newest first', async () => {
    const [newest, second] = articles;
    const tagged = articles.at(-1)!;
    mockIdentities.mockResolvedValue({ ...noIdentities, articulos: [second.author] });
    prismaMock.articleAuthor.findMany.mockResolvedValue([{ articleId: tagged.id }] as any);

    const result = await getProfileArticles('u1');
    const ids = result.map(({ article }) => article.id);

    expect(ids).toContain(tagged.id);
    expect(ids).toContain(second.id);
    expect(result.find(({ article }) => article.id === tagged.id)?.index).toBe(articles.length - 1);
    const dates = result.map(({ article }) => article.date);
    expect([...dates].sort().reverse()).toEqual(dates);
    if (newest.author !== second.author) expect(ids).not.toContain(newest.id);
  });

  it('is empty without authorships or links', async () => {
    prismaMock.articleAuthor.findMany.mockResolvedValue([]);
    await expect(getProfileArticles('u1')).resolves.toEqual([]);
  });
});

describe('getProfileConversations', () => {
  it('lists the conversations a linked WhatsApp name took part in, newest first', async () => {
    const name = conversations.find((conversation) => conversation.participants.length > 0)!
      .participants[0];
    mockIdentities.mockResolvedValue({ ...noIdentities, whatsapp: [name] });

    const result = await getProfileConversations('u1');

    expect(result.length).toBeGreaterThan(0);
    expect(result.every((conversation) => conversation.participants.includes(name))).toBe(true);
    const dates = result.map((conversation) => conversation.date);
    expect([...dates].sort().reverse()).toEqual(dates);
  });

  it('is empty without linked names', async () => {
    await expect(getProfileConversations('u1')).resolves.toEqual([]);
  });
});

describe('getProfileContributions', () => {
  const stats = {
    mergedPrs: 100,
    commits: 900,
    topContributors: [
      { login: 'ana', mergedPrs: 3, commits: 10, linesAdded: 50 },
      { login: 'ana-alt', mergedPrs: 1, commits: 2, linesAdded: 5 },
      { login: 'beto', mergedPrs: 7, commits: 30, linesAdded: 70 },
    ],
  };

  it('sums the contributions of the linked GitHub logins', async () => {
    mockIdentities.mockResolvedValue({ ...noIdentities, github: ['ana', 'ana-alt'] });
    mockStats.mockResolvedValue(stats);

    await expect(getProfileContributions('u1')).resolves.toEqual({
      linked: true,
      contributions: [stats.topContributors[0], stats.topContributors[1]],
      totals: { mergedPrs: 100, commits: 900 },
      mergedPrs: 4,
      commits: 12,
      linesAdded: 55,
    });
  });

  it('reports unknown lines when any contributor lacks them', async () => {
    mockIdentities.mockResolvedValue({ ...noIdentities, github: ['ana'] });
    mockStats.mockResolvedValue({
      ...stats,
      topContributors: [{ login: 'ana', mergedPrs: 1, commits: 1, linesAdded: null }],
    });

    expect((await getProfileContributions('u1')).linesAdded).toBeNull();
  });

  it('does not read the stats when no login is linked', async () => {
    await expect(getProfileContributions('u1')).resolves.toEqual({
      linked: false,
      contributions: [],
      totals: { mergedPrs: 0, commits: 0 },
      mergedPrs: 0,
      commits: 0,
      linesAdded: 0,
    });
    expect(mockStats).not.toHaveBeenCalled();
  });
});

describe('getProfileCounts', () => {
  const mockEmptyProfile = () => {
    prismaMock.project.findMany.mockResolvedValue([]);
    prismaMock.advice.findMany.mockResolvedValue([]);
    prismaMock.user.findUnique.mockResolvedValue(user as any);
    prismaMock.talk.findMany.mockResolvedValue([{ id: 't1' }, { id: 't2' }] as any);
    prismaMock.articleAuthor.findMany.mockResolvedValue([]);
    prismaMock.event.findMany.mockResolvedValue([{ id: 'e1' }] as any);
    prismaMock.galleryItem.findMany.mockResolvedValue([]);
    prismaMock.setup.findMany.mockResolvedValue([{ id: 's1' }] as any);
  };

  it('counts every tab, without contributions when there are none', async () => {
    mockEmptyProfile();
    await expect(getProfileCounts('u1')).resolves.toEqual({
      proyectos: 0,
      consejos: 0,
      charlas: 2,
      articulos: 0,
      videos: 0,
      cursos: 0,
      eventos: 1,
      fotos: 0,
      setups: 1,
      trabajando: 0,
      conversaciones: 0,
    });
  });

  it('counts merged PRs as contributions when the user has some', async () => {
    mockEmptyProfile();
    mockIdentities.mockResolvedValue({ ...noIdentities, github: ['ana'] });
    mockStats.mockResolvedValue({
      mergedPrs: 9,
      commits: 9,
      topContributors: [{ login: 'ana', mergedPrs: 5, commits: 8, linesAdded: 1 }],
    });

    expect((await getProfileCounts('u1')).contribuciones).toBe(5);
  });
});
