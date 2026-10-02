import type { DisplayBadge } from '@/lib/badges';

// Badges people earn on their own for what they do in the community. Nobody awards them: they
// are worked out from the user's activity every time a profile or /logros renders, so they come
// and go with the data (e.g. a new #1 contributor after a stats refresh). Pure definitions here,
// so client components can import them; the counts come from src/lib/achievement-metrics.

/** What each achievement counts for a user. */
export type AchievementMetrics = {
  /** Talks they gave as a speaker. */
  talksGiven: number;
  /** Commits to the website's repo, through the GitHub logins linked to them. */
  commits: number;
  /** Their spot among the repo's contributors (1 = top), or `null` if they never contributed. */
  contributorRank: number | null;
  /** Talks from /charlas they marked as watched. */
  talksWatched: number;
  /** Events they organized that already happened. */
  eventsOrganized: number;
};

export const EMPTY_METRICS: AchievementMetrics = {
  talksGiven: 0,
  commits: 0,
  contributorRank: null,
  talksWatched: 0,
  eventsOrganized: 0,
};

export type Achievement = DisplayBadge & {
  /** Short phrasing of the goal, e.g. "dar 1 charla". */
  goal: string;
  /** How to get it, in a sentence. */
  howTo: string;
  /** Where to go to work on it. */
  href: string;
  /** Also shown next to the name on the profile header, not only in the badges block. */
  highlight?: boolean;
  /** How far along a user is: `current` out of `target`. */
  progress: (metrics: AchievementMetrics) => { current: number; target: number };
};

type CountMetric = Exclude<keyof AchievementMetrics, 'contributorRank'>;

/** Progress towards `target` of a plain count. */
const count = (metric: CountMetric, target: number) => (metrics: AchievementMetrics) => ({
  current: Math.min(metrics[metric], target),
  target,
});

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'top-contributor',
    highlight: true,
    name: 'Top contributor',
    description: 'Es quien más aportó al código de la plataforma de programaConNosotros.',
    icon: 'trophy',
    tone: 'gold',
    goal: 'ser #1 en contribuciones',
    howTo: 'Mergeá más PRs que nadie en el repo de la plataforma.',
    href: '/desarrollo',
    progress: ({ contributorRank }) => ({ current: contributorRank === 1 ? 1 : 0, target: 1 }),
  },
  {
    id: 'contributor',
    highlight: true,
    name: 'Contributor',
    description: 'Aportó código a la plataforma open-source de programaConNosotros.',
    icon: 'code',
    tone: 'cyan',
    goal: '1 commit en el repo',
    howTo: 'Tomá un issue del repo de la plataforma y mandá tu primer PR.',
    href: '/desarrollo',
    progress: count('commits', 1),
  },
  {
    id: 'speaker',
    highlight: true,
    name: 'Speaker',
    description: 'Dio una charla en un evento de la comunidad.',
    icon: 'mic',
    tone: 'purple',
    goal: 'dar 1 charla',
    howTo: 'Mandá una propuesta de charla cuando un evento abra el call for speakers.',
    href: '/eventos',
    progress: count('talksGiven', 1),
  },
  {
    id: 'talks-watched-25',
    name: 'Espectador',
    description: 'Vio 25 charlas recomendadas por la comunidad.',
    icon: 'monitor-play',
    tone: 'silver',
    goal: 'ver 25 charlas',
    howTo: 'Mirá las charlas de /charlas y marcalas como vistas.',
    href: '/charlas',
    progress: count('talksWatched', 25),
  },
  {
    id: 'event-organizer',
    name: 'Organizador',
    description: 'Organizó un evento de la comunidad.',
    icon: 'megaphone',
    tone: 'green',
    goal: 'organizar 1 evento',
    howTo: 'Proponé una meetup, un cowork o una juntada y organizala con el equipo de PCN.',
    href: '/eventos',
    progress: count('eventsOrganized', 1),
  },
  {
    id: 'event-organizer-10',
    name: 'Productor',
    description: 'Organizó 10 eventos de la comunidad o más.',
    icon: 'rocket',
    tone: 'gold',
    goal: 'organizar 10 eventos',
    howTo: 'Seguí organizando: cada meetup, cowork o jornada que hagas suma.',
    href: '/eventos',
    progress: count('eventsOrganized', 10),
  },
];

export const isAchieved = (achievement: Achievement, metrics: AchievementMetrics) => {
  const { current, target } = achievement.progress(metrics);
  return current >= target;
};

/** The achievements a user already earned, in `ACHIEVEMENTS` order. */
export const earnedAchievements = (metrics: AchievementMetrics) =>
  ACHIEVEMENTS.filter((achievement) => isAchieved(achievement, metrics)).map(
    ({ id, name, description, icon, tone, highlight }) => ({
      id,
      name,
      description,
      icon,
      tone,
      highlight: !!highlight,
    }),
  );
