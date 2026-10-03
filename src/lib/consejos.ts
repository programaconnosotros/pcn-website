import type { Advise, Like, User } from '@prisma/client';
import type { ExtractedConsejo } from '@/data/consejos-extraidos';
import type { LinkedUser } from '@/lib/identity-links';

// One shape for every consejo on /consejos: the ones members publish (Advise rows) and the ones
// extracted automatically from /conversaciones (src/data/consejos-extraidos). Plain data, so
// server pages can hand it to client components.

export type ConsejoAuthor = {
  /** Platform user id, or `null` for a WhatsApp member nobody linked to a profile yet. */
  id: string | null;
  name: string;
  image: string | null;
};

export type ConsejoSource = {
  /** Title and date of the conversation the consejo was extracted from. */
  title: string;
  date: string;
  hash: string;
  href: string;
};

export type Consejo = {
  id: string;
  content: string;
  /** ISO date: when it was published, or the day of the conversation it came from. */
  createdAt: string;
  author: ConsejoAuthor;
  /** Who liked it. Only published consejos can be liked; extracted ones are `null`. */
  likes: Pick<Like, 'userId'>[] | null;
  commentCount: number;
  tags: string[];
  /** Set when the consejo was extracted automatically from a conversation. */
  source: ConsejoSource | null;
};

export type AdviseWithAuthor = Advise & {
  author: Pick<User, 'id' | 'name' | 'image'>;
  likes: Pick<Like, 'userId'>[];
  _count?: { comments: number };
};

export const fromAdvise = (advise: AdviseWithAuthor): Consejo => ({
  id: advise.id,
  content: advise.content,
  createdAt: new Date(advise.createdAt).toISOString(),
  author: { id: advise.author.id, name: advise.author.name, image: advise.author.image },
  likes: advise.likes.map(({ userId }) => ({ userId })),
  commentCount: advise._count?.comments ?? 0,
  tags: [],
  source: null,
});

export const fromExtracted = (
  consejo: ExtractedConsejo,
  profiles: Record<string, LinkedUser>,
): Consejo => {
  const linked = profiles[consejo.member];
  return {
    id: consejo.id,
    content: consejo.content,
    // Noon UTC keeps the conversation's calendar day in every Argentine timezone.
    createdAt: `${consejo.conversation.date}T12:00:00.000Z`,
    author: linked
      ? { id: linked.id, name: linked.name, image: linked.image }
      : { id: null, name: consejo.member, image: null },
    likes: null,
    commentCount: 0,
    tags: consejo.tags,
    source: { ...consejo.conversation },
  };
};

/** Newest first; ties keep their order. */
export const sortByNewest = (consejos: Consejo[]) =>
  [...consejos].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

// Topics for the /consejos filter. Extracted consejos come tagged; published ones get the topics
// whose keywords start a word in their text (accent-insensitive), so both filter alike.
export const CONSEJO_TOPICS: Record<string, string[]> = {
  carrera: [
    'carrera',
    'trabajo',
    'empleo',
    'junior',
    'senior',
    'cv',
    'linkedin',
    'crecer',
    'industria',
  ],
  entrevistas: ['entrevista', 'reclutador', 'recruiter', 'challenge'],
  aprendizaje: ['aprend', 'estudi', 'curso', 'libro', 'leer', 'practica', 'error'],
  arquitectura: ['arquitectura', 'microservicio', 'monolito', 'patron', 'solid', 'kiss', 'dominio'],
  testing: ['test', 'qa', 'bdd', 'tdd', 'calidad'],
  herramientas: ['git', 'herramienta', 'terminal', 'editor', 'vim', 'pnpm', 'npm', 'docker'],
  ia: ['ia', 'ai', 'llm', 'agente', 'prompt', 'claude', 'chatgpt', 'tokens'],
  freelance: ['freelance', 'cliente', 'presupuest', 'cobr', 'precio'],
  ingles: ['ingles', 'english', 'idioma'],
  'open-source': ['open source', 'opensource', 'codigo abierto', 'contribu'],
  productividad: ['productiv', 'foco', 'habito', 'organiz'],
  comunidad: ['comunidad', 'colega', 'equipo', 'networking', 'mentor'],
  backend: ['backend', 'api', 'servidor', 'cola', 'webhook'],
  frontend: ['frontend', 'react', 'css', 'navegador', 'ui', 'ux'],
  devops: ['devops', 'deploy', 'despleg', 'nube', 'cloud', 'aws', 'kubernetes'],
  'bases-de-datos': ['base de datos', 'bases de datos', 'sql', 'postgres', 'indice', 'consulta'],
  seguridad: ['seguridad', 'vulnerab', 'ataque', 'privilegio'],
};

/** Lowercase, no accents, punctuation as spaces, padded so ` word` matches a word start. */
const normalizeText = (text: string) =>
  ` ${text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')} `;

export const consejoTopics = (consejo: Pick<Consejo, 'content' | 'tags'>): string[] => {
  if (consejo.tags.length > 0) return consejo.tags;
  const text = normalizeText(consejo.content);
  return Object.entries(CONSEJO_TOPICS)
    .filter(([, keywords]) => keywords.some((keyword) => text.includes(` ${keyword}`)))
    .map(([topic]) => topic);
};

export type ConsejoOrigin = 'todos' | 'manual' | 'auto';
export type ConsejoSort = 'recientes' | 'antiguos' | 'likes' | 'comentados';

export type ConsejoFilters = {
  query: string;
  topic: string | null;
  /** Author key (see `authorKey`). */
  author: string | null;
  origin: ConsejoOrigin;
  sort: ConsejoSort;
};

export const DEFAULT_CONSEJO_FILTERS: ConsejoFilters = {
  query: '',
  topic: null,
  author: null,
  origin: 'todos',
  sort: 'recientes',
};

/** Platform user id, or the WhatsApp name for members nobody linked yet. */
export const authorKey = ({ author }: Pick<Consejo, 'author'>) => author.id ?? `wa:${author.name}`;

/** Search, filter and sort the list the way /consejos shows it. */
export const filterConsejos = (consejos: Consejo[], filters: ConsejoFilters): Consejo[] => {
  const query = normalizeText(filters.query).trim();
  const matches = consejos.filter(
    (consejo) =>
      (filters.origin === 'todos' || (filters.origin === 'auto') === (consejo.source !== null)) &&
      (!filters.author || authorKey(consejo) === filters.author) &&
      (!filters.topic || consejoTopics(consejo).includes(filters.topic)) &&
      (!query ||
        normalizeText(
          [consejo.content, consejo.author.name, consejo.source?.title ?? ''].join(' '),
        ).includes(query)),
  );

  const likes = (consejo: Consejo) => consejo.likes?.length ?? 0;
  const byNewest = (a: Consejo, b: Consejo) => b.createdAt.localeCompare(a.createdAt);
  const comparators: Record<ConsejoSort, (_a: Consejo, _b: Consejo) => number> = {
    recientes: byNewest,
    antiguos: (a, b) => -byNewest(a, b),
    likes: (a, b) => likes(b) - likes(a) || byNewest(a, b),
    comentados: (a, b) => b.commentCount - a.commentCount || byNewest(a, b),
  };
  return [...matches].sort(comparators[filters.sort]);
};
