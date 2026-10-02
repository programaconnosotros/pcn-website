import prisma from '@/lib/prisma';
import { getCollaborationStats } from '@/lib/github-stats';
import { externalTalks } from '@/components/videos/videos';
import { EMPTY_METRICS, type AchievementMetrics } from '@/lib/achievements';

// The counts behind each achievement (src/lib/achievements), for some users or for everyone.
// One query per metric for the whole set, so /logros costs the same as a single profile.

const linkedNames = async (source: 'github' | 'whatsapp', userIds?: string[]) => {
  const links = await prisma.identityLink.findMany({
    where: { source, ...(userIds && { userId: { in: userIds } }) },
    select: { userId: true, externalName: true },
  });
  const byUser = new Map<string, string[]>();
  for (const { userId, externalName } of links) {
    byUser.set(userId, [...(byUser.get(userId) ?? []), externalName]);
  }
  return byUser;
};

/**
 * Achievement metrics per user id. Pass `userIds` to load only those users; leave it out for
 * every user that has any activity. Users with no activity at all are left out of the map.
 */
export const getAchievementMetrics = async (
  userIds?: string[],
): Promise<Map<string, AchievementMetrics>> => {
  const forUsers = userIds ? { userId: { in: userIds } } : {};

  const now = new Date();
  const [
    talkSpeakers,
    githubLogins,
    githubStats,
    watchedTalks,
    organizers,
    readArticles,
    registrations,
  ] = await Promise.all([
    prisma.talkSpeaker.groupBy({
      by: ['userId'],
      where: { userId: userIds ? { in: userIds } : { not: null } },
      _count: { _all: true },
    }),
    linkedNames('github', userIds),
    getCollaborationStats(),
    prisma.contentMark.groupBy({
      by: ['userId'],
      where: {
        ...forUsers,
        contentType: 'video',
        mark: 'watched',
        contentId: { in: externalTalks.map(({ id }) => id) },
      },
      _count: { _all: true },
    }),
    prisma.eventOrganizer.groupBy({
      by: ['userId'],
      where: { ...forUsers, event: { deletedAt: null, date: { lte: now } } },
      _count: { _all: true },
    }),
    prisma.contentMark.groupBy({
      by: ['userId'],
      where: { ...forUsers, contentType: 'article', mark: 'read' },
      _count: { _all: true },
    }),
    prisma.eventRegistration.groupBy({
      by: ['userId'],
      where: { ...forUsers, cancelledAt: null, event: { deletedAt: null, date: { lte: now } } },
      _count: { _all: true },
    }),
  ]);

  const metrics = new Map<string, AchievementMetrics>();
  const of = (userId: string) => {
    let entry = metrics.get(userId);
    if (!entry) {
      entry = { ...EMPTY_METRICS };
      metrics.set(userId, entry);
    }
    return entry;
  };

  for (const { userId, _count } of talkSpeakers) {
    if (userId) of(userId).talksGiven = _count._all;
  }

  for (const { userId, _count } of watchedTalks) of(userId).talksWatched = _count._all;
  for (const { userId, _count } of organizers) of(userId).eventsOrganized = _count._all;
  for (const { userId, _count } of readArticles) of(userId).articlesRead = _count._all;
  for (const { userId, _count } of registrations) of(userId).eventsAttended = _count._all;

  // Contributors are ranked like /desarrollo lists them: merged PRs, then commits.
  const contributors = githubStats.topContributors;
  for (const [userId, logins] of githubLogins) {
    const ranks = logins
      .map((login) => contributors.findIndex((contributor) => contributor.login === login))
      .filter((index) => index >= 0);
    if (ranks.length === 0) continue;
    const entry = of(userId);
    entry.contributorRank = Math.min(...ranks) + 1;
    entry.commits = ranks.reduce((sum, index) => sum + contributors[index].commits, 0);
  }

  return metrics;
};

/** Achievement metrics for one user. */
export const getUserAchievementMetrics = async (userId: string) =>
  (await getAchievementMetrics([userId])).get(userId) ?? EMPTY_METRICS;
