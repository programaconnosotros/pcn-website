import { prismaMock } from '@/test/prisma';
import { getCollaborationStats } from '@/lib/github-stats';
import { externalTalks } from '@/components/videos/videos';
import { conversations } from '@/data/whatsapp-conversations';
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

  it('earns contributor for any commit and top contributor only at #1', () => {
    expect(ids({ ...EMPTY_METRICS, commits: 3, contributorRank: 2 })).toEqual(['contributor']);
    expect(ids({ ...EMPTY_METRICS, commits: 300, contributorRank: 1 })).toEqual([
      'top-contributor',
      'contributor',
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

  it('earns conversador after 100 conversations', () => {
    expect(ids({ ...EMPTY_METRICS, conversations: 99 })).toEqual([]);
    expect(ids({ ...EMPTY_METRICS, conversations: 100 })).toEqual(['conversations-100']);
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
  });

  it('counts talks per speaker', async () => {
    (prismaMock.talkSpeaker.groupBy as jest.Mock).mockResolvedValue([
      { userId: 'user-1', _count: { _all: 2 } },
    ]);

    const metrics = await getAchievementMetrics();

    expect(metrics.get('user-1')).toEqual({ ...EMPTY_METRICS, talksGiven: 2 });
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

  it('returns empty metrics for a user without activity', async () => {
    await expect(getUserAchievementMetrics('user-9')).resolves.toEqual(EMPTY_METRICS);
  });
});
