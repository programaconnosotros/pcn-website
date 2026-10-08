import { prismaMock } from '@/test/prisma';
import { getCollaborationStats } from '@/lib/github-stats';
import { externalTalks } from '@/components/videos/videos';
import { conversations } from '@/data/whatsapp-conversations';
import { extractedConsejos } from '@/data/consejos-extraidos';
import { ACHIEVEMENTS, EMPTY_METRICS, earnedAchievements } from './achievements';
import { getAchievementMetrics, getUserAchievementMetrics } from './achievement-metrics';

const ids = (metrics: Parameters<typeof earnedAchievements>[0]) =>
  earnedAchievements(metrics).map(({ id }) => id);

describe('earnedAchievements', () => {
  it('earns nothing without activity', () => {
    expect(ids(EMPTY_METRICS)).toEqual([]);
  });

  it('earns speaker after one talk', () => {
    expect(ids({ ...EMPTY_METRICS, talksGiven: 1 })).toEqual(['speaker']);
  });

  it('earns contributor for any commit and top contributor (instead) only at #1', () => {
    expect(ids({ ...EMPTY_METRICS, commits: 3, contributorRank: 2 })).toEqual(['contributor']);
    // The top contributor doesn't also show "Contributor".
    expect(ids({ ...EMPTY_METRICS, commits: 300, contributorRank: 1 })).toEqual([
      'top-contributor',
    ]);
  });

  it('earns top speaker and the conversations crown only at #1', () => {
    expect(ids({ ...EMPTY_METRICS, talksGiven: 3, speakerRank: 2 })).toEqual(['speaker']);
    // The top speaker doesn't also show "Speaker".
    expect(ids({ ...EMPTY_METRICS, talksGiven: 9, speakerRank: 1 })).toEqual(['top-speaker']);
    expect(ids({ ...EMPTY_METRICS, conversations: 120, conversationsRank: 1 })).toEqual([
      'conversations-100',
      'top-conversations',
    ]);
  });

  it('earns consejero at 25 consejos and top consejero (too) only at #1', () => {
    expect(ids({ ...EMPTY_METRICS, consejos: 30, consejosRank: 2 })).toEqual(['consejos-25']);
    expect(ids({ ...EMPTY_METRICS, consejos: 3, consejosRank: 1 })).toEqual(['top-consejos']);
    expect(ids({ ...EMPTY_METRICS, consejos: 90, consejosRank: 1 })).toEqual([
      'consejos-25',
      'top-consejos',
    ]);
  });

  it('earns espectador after watching 25 talks', () => {
    expect(ids({ ...EMPTY_METRICS, talksWatched: 24 })).toEqual([]);
    expect(ids({ ...EMPTY_METRICS, talksWatched: 25 })).toEqual(['talks-watched-25']);
  });

  it('earns organizador after organizing an event', () => {
    expect(ids({ ...EMPTY_METRICS, eventsOrganized: 1 })).toEqual(['event-organizer']);
  });

  it('earns productor after organizing 10 events', () => {
    expect(ids({ ...EMPTY_METRICS, eventsOrganized: 9 })).toEqual(['event-organizer']);
    expect(ids({ ...EMPTY_METRICS, eventsOrganized: 10 })).toEqual([
      'event-organizer',
      'event-organizer-10',
    ]);
  });

  it('earns lector after reading 25 articles', () => {
    expect(ids({ ...EMPTY_METRICS, articlesRead: 25 })).toEqual(['articles-read-25']);
  });

  it('earns habitué after going to 10 events', () => {
    expect(ids({ ...EMPTY_METRICS, eventsAttended: 10 })).toEqual(['events-attended-10']);
  });

  it('earns locuaz after 100 conversations', () => {
    expect(ids({ ...EMPTY_METRICS, conversations: 99 })).toEqual([]);
    expect(ids({ ...EMPTY_METRICS, conversations: 100 })).toEqual(['conversations-100']);
  });

  it('earns builder after sharing a project', () => {
    expect(ids({ ...EMPTY_METRICS, projectsShared: 1 })).toEqual(['project-shared']);
  });

  it('earns consejero after 25 consejos', () => {
    expect(ids({ ...EMPTY_METRICS, consejos: 24 })).toEqual([]);
    expect(ids({ ...EMPTY_METRICS, consejos: 25 })).toEqual(['consejos-25']);
  });

  it('caps progress at the target', () => {
    const speaker = ACHIEVEMENTS.find(({ id }) => id === 'speaker')!;
    expect(speaker.progress({ ...EMPTY_METRICS, talksGiven: 5 })).toEqual({
      current: 1,
      target: 1,
    });
  });
});

describe('getAchievementMetrics', () => {
  beforeEach(() => {
    (prismaMock.talkSpeaker.groupBy as jest.Mock).mockResolvedValue([]);
    prismaMock.identityLink.findMany.mockResolvedValue([]);
    (prismaMock.contentMark.groupBy as jest.Mock).mockResolvedValue([]);
    (prismaMock.eventOrganizer.groupBy as jest.Mock).mockResolvedValue([]);
    (prismaMock.eventRegistration.groupBy as jest.Mock).mockResolvedValue([]);
    prismaMock.project.findMany.mockResolvedValue([]);
    (prismaMock.advice.groupBy as jest.Mock).mockResolvedValue([]);
  });

  it('counts talks per speaker', async () => {
    (prismaMock.talkSpeaker.groupBy as jest.Mock).mockResolvedValue([
      { userId: 'user-1', _count: { _all: 2 } },
    ]);

    const metrics = await getAchievementMetrics();

    expect(metrics.get('user-1')).toEqual({ ...EMPTY_METRICS, talksGiven: 2, speakerRank: 1 });
  });

  it('ranks speakers against everyone, even when loading a single profile', async () => {
    (prismaMock.talkSpeaker.groupBy as jest.Mock).mockImplementation(async ({ where }: any) =>
      where.userId.in
        ? [{ userId: 'user-2', _count: { _all: 3 } }]
        : [
            { userId: 'user-1', _count: { _all: 7 } },
            { userId: 'user-2', _count: { _all: 3 } },
            { userId: 'user-3', _count: { _all: 7 } },
          ],
    );

    const metrics = await getAchievementMetrics(['user-2']);
    expect(metrics.get('user-2')).toMatchObject({ talksGiven: 3, speakerRank: 2 });
  });

  it('crowns whoever took part in the most conversations', async () => {
    const counts = new Map<string, number>();
    for (const { participants } of conversations)
      for (const name of new Set(participants)) counts.set(name, (counts.get(name) ?? 0) + 1);
    const [top] = [...counts.entries()].sort((a, b) => b[1] - a[1]);
    const other = [...counts.entries()].find(([, count]) => count < top[1])!;
    prismaMock.identityLink.findMany.mockImplementation((async ({ where }: any) =>
      where.source === 'whatsapp'
        ? [
            { userId: 'user-1', externalName: top[0] },
            { userId: 'user-2', externalName: other[0] },
          ]
        : []) as any);

    const metrics = await getAchievementMetrics();
    expect(metrics.get('user-1')).toMatchObject({ conversations: top[1], conversationsRank: 1 });
    expect(metrics.get('user-2')?.conversationsRank).toBeGreaterThan(1);
  });

  it('ranks users by their linked GitHub logins', async () => {
    const [first, second] = (await getCollaborationStats()).topContributors;
    prismaMock.identityLink.findMany.mockImplementation((async ({ where }: any) =>
      where.source === 'github'
        ? [
            { userId: 'user-1', externalName: first.login },
            { userId: 'user-2', externalName: second.login },
            { userId: 'user-3', externalName: 'not-a-contributor' },
          ]
        : []) as any);

    const metrics = await getAchievementMetrics();

    expect(metrics.get('user-1')).toMatchObject({ contributorRank: 1, commits: first.commits });
    expect(metrics.get('user-2')).toMatchObject({ contributorRank: 2, commits: second.commits });
    expect(metrics.has('user-3')).toBe(false);
  });

  it('counts only watched videos that are talks', async () => {
    (prismaMock.contentMark.groupBy as jest.Mock).mockResolvedValue([
      { userId: 'user-1', _count: { _all: 25 } },
    ]);

    const metrics = await getAchievementMetrics(['user-1']);

    expect(metrics.get('user-1')).toMatchObject({ talksWatched: 25 });
    expect(prismaMock.contentMark.groupBy).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId: { in: ['user-1'] },
          contentType: 'video',
          mark: 'watched',
          contentId: { in: externalTalks.map(({ id }) => id) },
        }),
      }),
    );
  });

  it('counts only organized events that already happened and were not deleted', async () => {
    (prismaMock.eventOrganizer.groupBy as jest.Mock).mockResolvedValue([
      { userId: 'user-1', _count: { _all: 3 } },
    ]);

    const metrics = await getAchievementMetrics();

    expect(metrics.get('user-1')).toMatchObject({ eventsOrganized: 3 });
    expect(prismaMock.eventOrganizer.groupBy).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { event: { deletedAt: null, date: { lte: expect.any(Date) } } },
      }),
    );
  });

  it('counts the articles marked as read', async () => {
    (prismaMock.contentMark.groupBy as jest.Mock).mockImplementation(async ({ where }) =>
      where.contentType === 'article' ? [{ userId: 'user-1', _count: { _all: 30 } }] : [],
    );

    const metrics = await getAchievementMetrics();

    expect(metrics.get('user-1')).toMatchObject({ articlesRead: 30, talksWatched: 0 });
  });

  it('counts registrations to past events that were not cancelled', async () => {
    (prismaMock.eventRegistration.groupBy as jest.Mock).mockResolvedValue([
      { userId: 'user-1', _count: { _all: 12 } },
    ]);

    const metrics = await getAchievementMetrics();

    expect(metrics.get('user-1')).toMatchObject({ eventsAttended: 12 });
    expect(prismaMock.eventRegistration.groupBy).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          cancelledAt: null,
          event: { deletedAt: null, date: { lte: expect.any(Date) } },
        },
      }),
    );
  });

  it('counts the conversations their linked WhatsApp names took part in', async () => {
    const [name] = conversations.find(({ participants }) => participants.length > 0)!.participants;
    prismaMock.identityLink.findMany.mockImplementation((async ({ where }: any) =>
      where.source === 'whatsapp' ? [{ userId: 'user-1', externalName: name }] : []) as any);

    const metrics = await getAchievementMetrics();

    const expected = conversations.filter(({ participants }) => participants.includes(name));
    expect(expected.length).toBeGreaterThan(0);
    expect(metrics.get('user-1')?.conversations).toBe(expected.length);
  });

  it('counts each project once per author or member', async () => {
    prismaMock.project.findMany.mockResolvedValue([
      { authorId: 'user-1', members: [{ userId: 'user-1' }, { userId: 'user-2' }] },
      { authorId: null, members: [{ userId: 'user-2' }] },
    ] as any);

    const metrics = await getAchievementMetrics();

    expect(metrics.get('user-1')?.projectsShared).toBe(1);
    expect(metrics.get('user-2')?.projectsShared).toBe(2);
  });

  it('leaves out the other members of a project when loading some users', async () => {
    prismaMock.project.findMany.mockResolvedValue([
      { authorId: 'user-1', members: [{ userId: 'user-2' }] },
    ] as any);

    const metrics = await getAchievementMetrics(['user-1']);

    expect(metrics.get('user-1')?.projectsShared).toBe(1);
    expect(metrics.has('user-2')).toBe(false);
  });

  it('counts published consejos per author', async () => {
    (prismaMock.advice.groupBy as jest.Mock).mockResolvedValue([
      { authorId: 'user-1', _count: { _all: 7 } },
    ]);

    const metrics = await getAchievementMetrics(['user-1']);

    expect(metrics.get('user-1')?.consejos).toBe(7);
    expect(prismaMock.advice.groupBy).toHaveBeenCalledWith(
      expect.objectContaining({ where: { authorId: { in: ['user-1'] } } }),
    );
  });

  it('adds the consejos extracted from conversations to their linked WhatsApp names', async () => {
    const { member } = extractedConsejos[0];
    const extracted = extractedConsejos.filter((consejo) => consejo.member === member).length;
    (prismaMock.advice.groupBy as jest.Mock).mockResolvedValue([
      { authorId: 'user-1', _count: { _all: 2 } },
    ]);
    prismaMock.identityLink.findMany.mockImplementation((async ({ where }: any) =>
      where.source === 'whatsapp' ? [{ userId: 'user-1', externalName: member }] : []) as any);

    const metrics = await getAchievementMetrics();

    expect(extracted).toBeGreaterThan(0);
    expect(metrics.get('user-1')?.consejos).toBe(2 + extracted);
  });

  it('returns empty metrics for a user without activity', async () => {
    await expect(getUserAchievementMetrics('user-9')).resolves.toEqual(EMPTY_METRICS);
  });
});
