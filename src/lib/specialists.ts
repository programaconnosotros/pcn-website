import prisma from '@/lib/prisma';
import { cached } from '@/lib/cache';
import { specialties } from '@/components/especialidades/specialties';

export interface Specialist {
  id: string;
  name: string;
  image: string | null;
  /** Marked it on their profile; otherwise inferred from their current job title. */
  explicit: boolean;
}

// Job titles that point at a specialty, for members who haven't marked any. Matched as whole
// words on the normalized title, so `ui` doesn't match "builder" nor `ia` "media".
const TITLE_KEYWORDS: Record<string, string[]> = {
  'web-frontend': ['frontend', 'front end', 'front-end'],
  backend: ['backend', 'back end', 'back-end'],
  fullstack: ['fullstack', 'full stack', 'full-stack'],
  'ios-mobile': ['ios'],
  'android-mobile': ['android'],
  'mobile-development': ['mobile', 'react native', 'flutter'],
  'game-dev': ['game', 'games', 'videojuegos', 'unity', 'unreal'],
  blockchain: ['blockchain', 'web3', 'solidity'],
  'data-science': ['data scientist', 'data science', 'data analyst', 'analytics', 'datos', 'bi'],
  'machine-learning': ['machine learning', 'ml', 'ai', 'ia', 'inteligencia artificial'],
  devops: ['devops', 'sre', 'cloud', 'platform engineer', 'infraestructura'],
  cybersecurity: ['security', 'seguridad', 'pentester', 'appsec', 'ciberseguridad'],
  networking: ['network', 'networking', 'redes'],
  qa: ['qa', 'tester', 'testing', 'quality'],
  'ui-ux-design': ['ux', 'ui', 'designer', 'diseñador', 'diseñadora', 'product designer'],
  'project-management': ['project manager', 'scrum master', 'pm', 'delivery manager'],
  'tech-lead': ['tech lead', 'technical lead', 'lider tecnico', 'team lead'],
  'engineering-management': [
    'engineering manager',
    'head of engineering',
    'director of engineering',
    'cto',
    'vp of engineering',
  ],
  'software-architect': ['architect', 'arquitecto', 'arquitecta'],
};

const normalize = (text: string) =>
  ` ${text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9ñ]+/g, ' ')
    .trim()} `;

/** Specialties a job title points at, e.g. "Sr. Frontend Developer" → web-frontend. */
export const specialtiesFromTitle = (title: string | null | undefined) => {
  if (!title) return [];
  const text = normalize(title);
  return Object.entries(TITLE_KEYWORDS)
    .filter(([, keywords]) => keywords.some((keyword) => text.includes(normalize(keyword))))
    .map(([id]) => id);
};

/**
 * Who in the community works in each specialty: those who marked it on their profile first,
 * then those whose current job title points at it (only when they haven't marked any).
 */
export const getSpecialists = cached(
  'specialists',
  async (): Promise<Record<string, Specialist[]>> => {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, image: true, specialties: true, jobTitle: true },
      orderBy: { name: 'asc' },
    });

    const bySpecialty: Record<string, Specialist[]> = Object.fromEntries(
      specialties.map((specialty) => [specialty.id, []]),
    );
    for (const user of users) {
      const explicit = user.specialties.length > 0;
      const ids = explicit ? user.specialties : specialtiesFromTitle(user.jobTitle);
      for (const id of ids)
        bySpecialty[id]?.push({ id: user.id, name: user.name, image: user.image, explicit });
    }
    for (const list of Object.values(bySpecialty))
      list.sort((a, b) => Number(b.explicit) - Number(a.explicit));
    return bySpecialty;
  },
  { models: ['User'] },
);
