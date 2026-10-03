'use server';

import prisma from '@/lib/prisma';
import { visibleGalleryItem } from '@/lib/gallery';
import { ACHIEVEMENTS, earnedAchievements } from '@/lib/achievements';
import { getUserAchievementMetrics } from '@/lib/achievement-metrics';

/** What a user hover card shows: only what their public profile already shows. */
export type UserSummary = {
  id: string;
  name: string;
  image: string | null;
  slogan: string | null;
  /** First position, e.g. "Senior SWE @ Acme"; falls back to career @ study place. */
  role: string | null;
  location: string | null;
  /** ISO date the account was created. */
  memberSince: string;
  isCofounder: boolean;
  isAmbassador: boolean;
  languages: string[];
  stats: {
    talks: number;
    eventsAttended: number;
    eventsOrganized: number;
    advises: number;
    projects: number;
    photos: number;
    commits: number;
    contributorRank: number | null;
  };
  achievements: { earned: number; total: number };
};

/**
 * Public summary of a platform user, for the hover cards on tagged mentions. Returns `null` when
 * the user doesn't exist (e.g. deleted after being tagged) so the card can say so.
 */
export async function getUserSummary(userId: string): Promise<UserSummary | null> {
  if (typeof userId !== 'string' || userId.length === 0 || userId.length > 64) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      image: true,
      slogan: true,
      jobTitle: true,
      enterprise: true,
      career: true,
      studyPlace: true,
      province: true,
      countryOfOrigin: true,
      isCofounder: true,
      isAmbassador: true,
      createdAt: true,
      positions: {
        select: { jobTitle: true, enterprise: true },
        orderBy: { order: 'asc' },
        take: 1,
      },
      languages: { select: { language: true }, take: 6 },
    },
  });
  if (!user) return null;

  const [metrics, advises, photos] = await Promise.all([
    getUserAchievementMetrics(userId),
    prisma.advise.count({ where: { authorId: userId } }),
    prisma.galleryItem.count({ where: { ...visibleGalleryItem, tags: { some: { userId } } } }),
  ]);

  // Profiles that never saved positions still have the single job they had before.
  const position = user.positions[0] ?? { jobTitle: user.jobTitle, enterprise: user.enterprise };
  const role =
    [position.jobTitle, position.enterprise].filter(Boolean).join(' @ ') ||
    [user.career, user.studyPlace].filter(Boolean).join(' @ ') ||
    null;

  return {
    id: user.id,
    name: user.name,
    image: user.image,
    slogan: user.slogan,
    role,
    location: [user.province, user.countryOfOrigin].filter(Boolean).join(', ') || null,
    memberSince: user.createdAt.toISOString(),
    isCofounder: user.isCofounder,
    isAmbassador: user.isAmbassador,
    languages: user.languages.map(({ language }) => language),
    stats: {
      talks: metrics.talksGiven,
      eventsAttended: metrics.eventsAttended,
      eventsOrganized: metrics.eventsOrganized,
      advises,
      projects: metrics.projectsShared,
      photos,
      commits: metrics.commits,
      contributorRank: metrics.contributorRank,
    },
    achievements: { earned: earnedAchievements(metrics).length, total: ACHIEVEMENTS.length },
  };
}
