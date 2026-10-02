import { prismaMock } from '@/test/prisma';
import { getCollaborationStats } from '@/lib/github-stats';
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
    prismaMock.talkSpeaker.groupBy.mockResolvedValue([] as any);
    prismaMock.identityLink.findMany.mockResolvedValue([]);
  });

  it('counts talks per speaker', async () => {
    prismaMock.talkSpeaker.groupBy.mockResolvedValue([
      { userId: 'user-1', _count: { _all: 2 } },
    ] as any);

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

  it('returns empty metrics for a user without activity', async () => {
    await expect(getUserAchievementMetrics('user-9')).resolves.toEqual(EMPTY_METRICS);
  });
});
