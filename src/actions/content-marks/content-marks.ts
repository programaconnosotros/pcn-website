// The personal marks users can leave on each kind of static content, e.g. `article → read`.
export const CONTENT_MARKS = {
  article: ['read', 'saved'],
  // YouTube videos, including the external talks on /charlas, keyed by video id.
  video: ['watched'],
  // Sections of the /entrevistas/guias preparation guides, keyed by `<track>/<section id>`.
  'interview-guide': ['read'],
} as const;

export type ContentType = keyof typeof CONTENT_MARKS;
export type ContentMarkKind<T extends ContentType = ContentType> =
  (typeof CONTENT_MARKS)[T][number];

export interface ContentMarkEntry {
  contentId: string;
  mark: string;
}

export const isValidContentMark = (contentType: string, mark: string) =>
  Object.hasOwn(CONTENT_MARKS, contentType) &&
  (CONTENT_MARKS[contentType as ContentType] as readonly string[]).includes(mark);
