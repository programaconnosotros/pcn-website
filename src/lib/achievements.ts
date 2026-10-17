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
  /** Their spot among speakers by talks given (1 = gave the most, ties share it), or `null`. */
  speakerRank: number | null;
  /**
   * Their spot among the people in /conversaciones by conversations taken part in (1 = the most,
   * ties share it), or `null` if they aren't in any or their WhatsApp name isn't linked.
   */
  conversationsRank: number | null;
  /**
   * Their spot among users by consejos (published plus extracted from /conversaciones; 1 = the
   * most, ties share it), or `null` if they have none.
   */
  consejosRank: number | null;
  /** Talks from /charlas they marked as watched. */
  talksWatched: number;
  /** Events they organized that already happened. */
  eventsOrganized: number;
  /** Articles from /lectura they marked as read. */
  articlesRead: number;
  /** Past events they signed up for on the platform and did not cancel. */
  eventsAttended: number;
  /** Conversations from the WhatsApp group (/conversaciones) they took part in. */
  conversations: number;
  /** Projects on /proyectos they published or are a member of. */
  projectsShared: number;
  /**
   * Consejos on /consejos: the ones they published plus the ones extracted automatically from
   * conversations where they gave the advice (through their linked WhatsApp names).
   */
  consejos: number;
};

export const EMPTY_METRICS: AchievementMetrics = {
  talksGiven: 0,
  commits: 0,
  contributorRank: null,
  speakerRank: null,
  conversationsRank: null,
  consejosRank: null,
  talksWatched: 0,
  eventsOrganized: 0,
  articlesRead: 0,
  eventsAttended: 0,
  conversations: 0,
  projectsShared: 0,
  consejos: 0,
};

export type Achievement = DisplayBadge & {
  /** Short phrasing of the goal, e.g. "dar 1 charla". */
  goal: string;
  /** How to get it, in a sentence. */
  howTo: string;
  /** Where to go to work on it. */
  href: string;
  /** How far along a user is: `current` out of `target`. */
  progress: (_metrics: AchievementMetrics) => { current: number; target: number };
};

type CountMetric = Exclude<
  keyof AchievementMetrics,
  'contributorRank' | 'speakerRank' | 'conversationsRank' | 'consejosRank'
>;

/** Progress towards `target` of a plain count. */
const count = (metric: CountMetric, target: number) => (metrics: AchievementMetrics) => ({
  current: Math.min(metrics[metric], target),
  target,
});

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'top-contributor',
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
    id: 'top-speaker',
    name: 'Top speaker',
    description: 'Es quien más charlas dio en la comunidad.',
    icon: 'mic',
    tone: 'gold',
    goal: 'ser #1 en charlas dadas',
    howTo: 'Dá más charlas que nadie en los eventos de la comunidad.',
    href: '/charlas',
    progress: ({ speakerRank }) => ({ current: speakerRank === 1 ? 1 : 0, target: 1 }),
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
  {
    id: 'articles-read-25',
    name: 'Lector',
    description: 'Leyó 25 artículos recomendados por la comunidad.',
    icon: 'book-open',
    tone: 'cyan',
    goal: 'leer 25 artículos',
    howTo: 'Leé los artículos de /lectura y marcalos como leídos.',
    href: '/lectura',
    progress: count('articlesRead', 25),
  },
  {
    id: 'events-attended-10',
    name: 'Habitué',
    description: 'Fue a 10 eventos de la comunidad o más.',
    icon: 'ticket',
    tone: 'purple',
    goal: 'ir a 10 eventos',
    howTo: 'Anotate en los eventos desde la plataforma y andá: cuentan los que ya pasaron.',
    href: '/eventos',
    progress: count('eventsAttended', 10),
  },
  {
    id: 'conversations-100',
    name: 'Locuaz',
    description: 'Participó en 100 conversaciones interesantes del grupo de WhatsApp o más.',
    icon: 'messages',
    tone: 'red',
    goal: 'participar en 100 conversaciones',
    howTo: 'Sumate a las charlas del grupo: las mejores quedan resumidas en /conversaciones.',
    href: '/conversaciones',
    progress: count('conversations', 100),
  },
  {
    id: 'top-conversations',
    name: 'Alma del grupo',
    description: 'Es quien participó en más conversaciones interesantes del grupo de WhatsApp.',
    icon: 'flame',
    tone: 'gold',
    goal: 'ser #1 en conversaciones',
    howTo: 'Participá en más charlas destacadas del grupo que nadie.',
    href: '/conversaciones',
    progress: ({ conversationsRank }) => ({
      current: conversationsRank === 1 ? 1 : 0,
      target: 1,
    }),
  },
  {
    id: 'project-shared',
    name: 'Builder',
    description: 'Compartió un proyecto con la comunidad.',
    icon: 'folder-git',
    tone: 'green',
    goal: 'compartir 1 proyecto',
    howTo: 'Publicá en /proyectos algo que hayas construido, solo o en equipo.',
    href: '/proyectos',
    progress: count('projectsShared', 1),
  },
  {
    id: 'consejos-25',
    name: 'Consejero',
    description: 'Tiene 25 consejos publicados en la comunidad o más.',
    icon: 'lightbulb',
    tone: 'green',
    goal: 'tener 25 consejos',
    howTo:
      'Publicá en /consejos lo que aprendiste. También suman los consejos tuyos extraídos de /conversaciones.',
    href: '/consejos',
    progress: count('consejos', 25),
  },
  {
    id: 'top-consejos',
    name: 'Top consejero',
    description: 'Es quien más consejos compartió en la comunidad.',
    icon: 'lightbulb',
    tone: 'gold',
    goal: 'ser #1 en consejos',
    howTo:
      'Publicá en /consejos más que nadie. También suman los consejos tuyos extraídos de /conversaciones.',
    href: '/consejos',
    progress: ({ consejosRank }) => ({ current: consejosRank === 1 ? 1 : 0, target: 1 }),
  },
];

export const isAchieved = (achievement: Achievement, metrics: AchievementMetrics) => {
  const { current, target } = achievement.progress(metrics);
  return current >= target;
};

/** Badges a higher one makes redundant: the top contributor doesn't also show "Contributor". */
const SUPERSEDED_BY: Record<string, string> = {
  contributor: 'top-contributor',
  speaker: 'top-speaker',
  'consejos-25': 'top-consejos',
  'conversations-100': 'top-conversations',
};

/** The achievements a user already earned, in `ACHIEVEMENTS` order. */
export const earnedAchievements = (metrics: AchievementMetrics) => {
  const earned = ACHIEVEMENTS.filter((achievement) => isAchieved(achievement, metrics));
  const ids = new Set(earned.map(({ id }) => id));
  return earned
    .filter(({ id }) => !(SUPERSEDED_BY[id] && ids.has(SUPERSEDED_BY[id])))
    .map(({ id, name, description, icon, tone }) => ({
      id,
      name,
      description,
      icon,
      tone,
    }));
};
