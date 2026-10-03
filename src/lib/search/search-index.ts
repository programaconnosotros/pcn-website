import { communityCourses, externalCourses } from '@/app/(platform)/cursos/courses';
import { articles } from '@/app/(platform)/lectura/articles';
import { videos } from '@/components/videos/videos';
import { specialties } from '@/components/especialidades/specialties';
import { visiblePrograms } from '@/components/os/programs';
import { conversations } from '@/data/whatsapp-conversations';
import { conversationHref } from '@/components/conversations/conversation-utils';
import { extractedConsejos } from '@/data/consejos-extraidos';
import type { SearchResult } from './types';

/**
 * Lowercase, without accents and with punctuation turned into spaces, so `programacion` matches
 * `Programación` and `ci/cd` matches `CI/CD`. Starts with a space so `includes(' ' + word)`
 * matches at the start of any word.
 */
export const normalizeSearchText = (text: string) =>
  ` ${text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()}`;

export interface IndexedEntry extends SearchResult {
  /** Normalized title, for ranking. */
  titleText: string;
  /** Normalized title plus everything else worth matching. */
  text: string;
}

export const toEntry = (result: SearchResult, ...extra: (string | undefined)[]): IndexedEntry => ({
  ...result,
  titleText: normalizeSearchText(result.title),
  text: normalizeSearchText([result.title, result.subtitle, ...extra].filter(Boolean).join(' ')),
});

const withQuery = (path: string, query: string) => `${path}?q=${encodeURIComponent(query)}`;

const buildStaticIndex = (): IndexedEntry[] => [
  ...visiblePrograms(false).map((program) =>
    toEntry({ type: 'seccion', title: program.name, href: program.url }, program.url),
  ),
  ...[...communityCourses, ...externalCourses].map((course) =>
    toEntry(
      {
        type: 'curso',
        title: course.name,
        subtitle: course.teachedBy,
        href: `/cursos/${course.id}`,
      },
      course.description,
    ),
  ),
  ...videos.map((video) =>
    toEntry(
      {
        type: 'video',
        title: video.title,
        subtitle: video.speaker ?? video.channel,
        href: `https://www.youtube.com/watch?v=${video.id}`,
      },
      video.channel,
    ),
  ),
  ...articles.map((article) =>
    toEntry(
      {
        type: 'lectura',
        title: article.title,
        subtitle: article.author,
        href: withQuery('/lectura', article.title),
      },
      article.source,
      article.category,
      article.description,
    ),
  ),
  ...specialties.map((specialty) =>
    toEntry(
      {
        type: 'especialidad',
        title: specialty.title,
        subtitle: specialty.summary,
        href: `/especialidades#${specialty.id}`,
      },
      specialty.idealFor,
    ),
  ),
  ...conversations.map((conversation) =>
    toEntry(
      {
        type: 'conversacion',
        title: conversation.title,
        subtitle: conversation.date,
        href: conversationHref(conversation),
      },
      conversation.summary,
      conversation.participants.join(' '),
    ),
  ),
  ...extractedConsejos.map((consejo) =>
    toEntry(
      {
        type: 'consejo',
        title: consejo.content.length > 90 ? `${consejo.content.slice(0, 89)}…` : consejo.content,
        subtitle: `${consejo.member} · auto-extraído`,
        href: `/consejos/${consejo.id}`,
      },
      consejo.content,
      consejo.member,
    ),
  ),
];

let staticIndex: IndexedEntry[] | null = null;
export const getStaticIndex = () => (staticIndex ??= buildStaticIndex());

/**
 * Every query word must start a word somewhere in the entry (`git` matches `GitHub`, not
 * `digital`). Title matches rank above body matches, and a title that starts with the query
 * ranks highest. `query` is normalized, so it starts with a space. Returns 0 for no match.
 */
export const scoreEntry = (entry: IndexedEntry, query: string, words: string[]) => {
  if (!words.every((word) => entry.text.includes(` ${word}`))) return 0;
  if (entry.titleText.startsWith(query)) return 4;
  if (entry.titleText.includes(query)) return 3;
  if (words.every((word) => entry.titleText.includes(` ${word}`))) return 2;
  return 1;
};

/** Best matches per type, at most `perType` each, ordered by score then original order. */
export const rankEntries = (entries: IndexedEntry[], rawQuery: string, perType = 5) => {
  const query = normalizeSearchText(rawQuery);
  const words = query.split(' ').filter(Boolean);
  if (words.length === 0) return [];

  const byType = new Map<string, { entry: IndexedEntry; score: number }[]>();
  entries.forEach((entry) => {
    const score = scoreEntry(entry, query, words);
    if (score === 0) return;
    const list = byType.get(entry.type) ?? [];
    list.push({ entry, score });
    byType.set(entry.type, list);
  });

  return [...byType.values()].flatMap((list) =>
    list
      .sort((a, b) => b.score - a.score)
      .slice(0, perType)
      .map(({ entry: { titleText: _t, text: _x, ...result } }) => result as SearchResult),
  );
};
