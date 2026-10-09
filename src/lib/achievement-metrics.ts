import prisma from '@/lib/prisma';
import { cached } from '@/lib/cache';
import { getCollaborationStats } from '@/lib/github-stats';
import { getExternalTalks } from '@/lib/recommendations';
import { conversations } from '@/data/whatsapp-conversations';
import { visibleExtractedConsejos } from '@/lib/hidden-consejos';
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

/** Dense rank of `value` among `values`, highest first: 1 for the top value, ties share it. */
export const denseRank = (value: number, values: number[]) =>
  new Set(values.filter((other) => other > value)).size + 1;

// How many conversations each name in /conversaciones took part in, for the conversations rank.
const conversationsByName = (() => {
  const counts = new Map<string, number>();
  for (const { participants } of conversations)
    for (const name of new Set(participants)) counts.set(name, (counts.get(name) ?? 0) + 1);
  return counts;
})();

/** Each user's consejos: the ones they published plus the ones extracted under their WhatsApp names. */
const consejosByUser = (
  advice: { authorId: string; _count: { _all: number } }[],
  whatsappNames: Map<string, string[]>,
  extracted: { member: string }[],
) => {
  const counts = new Map(advice.map(({ authorId, _count }) => [authorId, _count._all]));
  for (const [userId, names] of whatsappNames) {
    const given = extracted.filter(({ member }) => names.includes(member)).length;
    if (given > 0) counts.set(userId, (counts.get(userId) ?? 0) + given);
  }
  return counts;
};

const computeAchievementMetrics = async (
  userIds?: string[],
): Promise<Map<string, AchievementMetrics>> => {
  const forUsers = userIds ? { userId: { in: userIds } } : {};
  const [extractedConsejos, externalTalks] = await Promise.all([
    visibleExtractedConsejos(),
    getExternalTalks(),
  ]);

  const now = new Date();
  const [
    talkSpeakers,
    githubLogins,
    whatsappNames,
    githubStats,
    watchedTalks,
    organizers,
    readArticles,
    registrations,
    projects,
    advice,
    allSpeakers,
    allAdvice,
    allWhatsappNames,
  ] = await Promise.all([
    prisma.talkSpeaker.groupBy({
      by: ['userId'],
      where: { userId: userIds ? { in: userIds } : { not: null } },
      _count: { _all: true },
    }),
    linkedNames('github', userIds),
    linkedNames('whatsapp', userIds),
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
    prisma.project.findMany({
      where: userIds
        ? { OR: [{ authorId: { in: userIds } }, { members: { some: forUsers } }] }
        : undefined,
      select: { authorId: true, members: { select: { userId: true } } },
    }),
    prisma.advice.groupBy({
      by: ['authorId'],
      where: userIds ? { authorId: { in: userIds } } : undefined,
      _count: { _all: true },
    }),
    // Every speaker's count, to rank them even when loading a single profile.
    userIds
      ? prisma.talkSpeaker.groupBy({
          by: ['userId'],
          where: { userId: { not: null } },
          _count: { _all: true },
        })
      : null,
    // Same for consejos: everyone's published ones and WhatsApp names.
    userIds ? prisma.advice.groupBy({ by: ['authorId'], _count: { _all: true } }) : null,
    userIds ? linkedNames('whatsapp') : null,
  ]);
  const speakerCounts = (allSpeakers ?? talkSpeakers).map(({ _count }) => _count._all);
  const consejoCounts = consejosByUser(
    allAdvice ?? advice,
    allWhatsappNames ?? whatsappNames,
    extractedConsejos,
  );
  const everyConsejoCount = [...consejoCounts.values()];

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
    if (!userId) continue;
    of(userId).talksGiven = _count._all;
    of(userId).speakerRank = denseRank(_count._all, speakerCounts);
  }

  for (const { userId, _count } of watchedTalks) of(userId).talksWatched = _count._all;
  for (const { userId, _count } of organizers) of(userId).eventsOrganized = _count._all;
  for (const { userId, _count } of readArticles) of(userId).articlesRead = _count._all;
  for (const { userId, _count } of registrations) of(userId).eventsAttended = _count._all;

  for (const userId of userIds ?? consejoCounts.keys()) {
    const total = consejoCounts.get(userId) ?? 0;
    if (total === 0) continue;
    of(userId).consejos = total;
    of(userId).consejosRank = denseRank(total, everyConsejoCount);
  }

  for (const { authorId, members } of projects) {
    // Someone listed both as author and as member still shared the project once.
    const people = new Set([authorId, ...members.map(({ userId }) => userId)]);
    for (const userId of people) {
      if (userId && (!userIds || userIds.includes(userId))) of(userId).projectsShared += 1;
    }
  }

  for (const [userId, names] of whatsappNames) {
    const taken = conversations.filter(({ participants }) =>
      participants.some((name) => names.includes(name)),
    ).length;
    if (taken > 0) {
      of(userId).conversations = taken;
      // Ranked by their busiest linked name among everyone in the conversations.
      const best = Math.max(...names.map((name) => conversationsByName.get(name) ?? 0));
      of(userId).conversationsRank = denseRank(best, [...conversationsByName.values()]);
    }
  }

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

// Cached as entries (a Map doesn't survive JSON). Attending or organizing counts once the event
// date passes, which no write marks, so entries are also recomputed every hour.
const cachedAchievementMetrics = cached(
  'achievement-metrics',
  async (userIds: string[] | null) => [
    ...(await computeAchievementMetrics(userIds ?? undefined)).entries(),
  ],
  {
    models: [
      'TalkSpeaker',
      'IdentityLink',
      'ContentMark',
      'EventOrganizer',
      'Event',
      'EventRegistration',
      'Project',
      'ProjectMember',
      'Advice',
      'HiddenConsejo',
      'Recommendation',
    ],
    revalidate: 3600,
  },
);

/**
 * Achievement metrics per user id. Pass `userIds` to load only those users; leave it out for
 * every user that has any activity. Users with no activity at all are left out of the map.
 */
export const getAchievementMetrics = async (
  userIds?: string[],
): Promise<Map<string, AchievementMetrics>> =>
  new Map(await cachedAchievementMetrics(userIds ?? null));

/** Achievement metrics for one user. */
export const getUserAchievementMetrics = async (userId: string) =>
  (await getAchievementMetrics([userId])).get(userId) ?? EMPTY_METRICS;
