import { z } from 'zod';

// Recommending an article, book, course or video: what each kind asks for, how the form's text
// becomes the Recommendation's columns and what an item needs before it can be published.
// Shared by the forms (client) and the server actions, which validate everything again.

export const RECOMMENDATION_KINDS = ['ARTICLE', 'BOOK', 'COURSE', 'VIDEO'] as const;
export type RecommendationKindValue = (typeof RECOMMENDATION_KINDS)[number];

export const recommendationKindSchema = z.enum(RECOMMENDATION_KINDS);

/** Where admins review what members recommend. */
export const REVIEW_QUEUE_PATH = '/admin/recomendaciones';

/** How each kind is called in the UI, and where it's listed once approved. */
export const RECOMMENDATION_KIND_INFO: Record<
  RecommendationKindValue,
  { label: string; plural: string; article: 'un' | 'una'; href: string }
> = {
  ARTICLE: { label: 'artículo', plural: 'artículos', article: 'un', href: '/lectura' },
  BOOK: { label: 'libro', plural: 'libros', article: 'un', href: '/lectura' },
  COURSE: { label: 'curso', plural: 'cursos', article: 'un', href: '/cursos' },
  VIDEO: { label: 'video', plural: 'videos', article: 'un', href: '/videos' },
};

export const recommendationFieldNames = [
  'url',
  'title',
  'author',
  'coauthors',
  'source',
  'categories',
  'language',
  'publishedAt',
  'year',
  'imageUrl',
  'isbn',
  'duration',
  'hours',
  'youtubeUrls',
  'description',
  'isTalk',
  'isMadeByCommunity',
  'acceptDonations',
  'note',
] as const;
export type RecommendationFieldName = (typeof recommendationFieldNames)[number];

const text = (max: number) => z.string().trim().max(max, `Máximo ${max} caracteres`);

/** The form's values: plain text and checkboxes, the same for every kind. */
export const recommendationFormSchema = z.object({
  url: text(500).default(''),
  title: text(200).default(''),
  author: text(200).default(''),
  // Comma separated.
  coauthors: text(300).default(''),
  source: text(100).default(''),
  // Comma separated; an article uses the first one.
  categories: text(200).default(''),
  language: z.enum(['es', 'en']).default('es'),
  // YYYY-MM-DD.
  publishedAt: z
    .string()
    .trim()
    .regex(/^(\d{4}-\d{2}-\d{2})?$/, 'Fecha inválida')
    .default(''),
  year: z
    .string()
    .trim()
    .regex(/^(\d{4})?$/, 'Año inválido')
    .default(''),
  imageUrl: text(500).default(''),
  isbn: z
    .string()
    .trim()
    .regex(/^([0-9Xx-]{10,17})?$/, 'ISBN inválido')
    .default(''),
  // 34:31, 1:02:03 or seconds.
  duration: z
    .string()
    .trim()
    .regex(/^((\d+:)?\d{1,2}:\d{2}|\d+)?$/, 'Usá minutos:segundos, por ejemplo 34:31')
    .default(''),
  hours: z
    .string()
    .trim()
    .regex(/^(\d{1,3})?$/, 'Horas inválidas')
    .default(''),
  // One per line.
  youtubeUrls: text(3000).default(''),
  description: text(1000).default(''),
  isTalk: z.boolean().default(false),
  isMadeByCommunity: z.boolean().default(false),
  acceptDonations: z.boolean().default(false),
  note: text(500).default(''),
});

export type RecommendationFormValues = z.infer<typeof recommendationFormSchema>;
export type RecommendationFormInput = z.input<typeof recommendationFormSchema>;

export const EMPTY_RECOMMENDATION_FORM: RecommendationFormValues = recommendationFormSchema.parse(
  {},
);

/** The fields a member fills to recommend each kind, in order. Admins also see `ADMIN_FIELDS`. */
export const SUBMIT_FIELDS: Record<RecommendationKindValue, RecommendationFieldName[]> = {
  VIDEO: ['url', 'title', 'source', 'author', 'language', 'isTalk', 'note'],
  ARTICLE: ['url', 'title', 'author', 'language', 'categories', 'description', 'note'],
  BOOK: ['title', 'author', 'language', 'categories', 'url', 'isbn', 'year', 'description', 'note'],
  COURSE: ['url', 'title', 'author', 'description', 'note'],
};

/** What only admins edit (the rest of what the listing shows), in order. */
export const ADMIN_FIELDS: Record<RecommendationKindValue, RecommendationFieldName[]> = {
  VIDEO: ['publishedAt', 'duration'],
  ARTICLE: ['coauthors', 'source', 'publishedAt', 'imageUrl'],
  BOOK: ['imageUrl'],
  COURSE: [
    'imageUrl',
    'youtubeUrls',
    'hours',
    'publishedAt',
    'isMadeByCommunity',
    'acceptDonations',
  ],
};

/** What a member can't leave empty when recommending. */
export const REQUIRED_TO_SUBMIT: Record<RecommendationKindValue, RecommendationFieldName[]> = {
  VIDEO: ['url', 'title'],
  ARTICLE: ['url', 'title', 'author'],
  BOOK: ['title', 'author'],
  COURSE: ['url', 'title', 'author'],
};

const FIELD_LABELS: Record<RecommendationFieldName, string> = {
  url: 'link',
  title: 'título',
  author: 'autor',
  coauthors: 'coautores',
  source: 'sitio',
  categories: 'categoría',
  language: 'idioma',
  publishedAt: 'fecha',
  year: 'año',
  imageUrl: 'imagen',
  isbn: 'isbn',
  duration: 'duración',
  hours: 'horas',
  youtubeUrls: 'videos de youtube',
  description: 'descripción',
  isTalk: 'es una charla de una conferencia',
  isMadeByCommunity: 'hecho por la comunidad',
  acceptDonations: 'acepta donaciones',
  note: 'por qué lo recomendás',
};

const KIND_LABELS: Partial<
  Record<RecommendationKindValue, Partial<Record<RecommendationFieldName, string>>>
> = {
  VIDEO: { url: 'link de youtube', source: 'canal', author: 'orador', publishedAt: 'publicado' },
  BOOK: {
    author: 'autores',
    categories: 'categorías',
    url: 'link para comprarlo',
    imageUrl: 'tapa',
  },
  COURSE: { title: 'nombre', author: 'lo dicta', url: 'web del curso', imageUrl: 'logo' },
  ARTICLE: { imageUrl: 'avatar del autor' },
};

export const fieldLabel = (kind: RecommendationKindValue, field: RecommendationFieldName) =>
  KIND_LABELS[kind]?.[field] ?? FIELD_LABELS[field];

// ─── From the form to the columns ──────────────────────────────────────────────────────────────

const YOUTUBE_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'youtu.be',
  'www.youtube-nocookie.com',
]);
const YOUTUBE_ID = /^[\w-]{11}$/;

/** The id of a YouTube video from any of its URLs (watch, youtu.be, embed, shorts, live). */
export const parseYoutubeId = (raw: string): string | null => {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return null;
  }
  if (!['http:', 'https:'].includes(url.protocol) || !YOUTUBE_HOSTS.has(url.hostname)) return null;
  const id =
    url.hostname === 'youtu.be'
      ? url.pathname.slice(1)
      : url.pathname === '/watch'
        ? url.searchParams.get('v')
        : url.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)/)?.[1];
  return id && YOUTUBE_ID.test(id) ? id : null;
};

const isHttpUrl = (raw: string) => {
  try {
    const url = new URL(raw);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
};

/** An image is a file of the site (`/lectura/x.webp`) or an https URL. */
const isImageUrl = (raw: string) =>
  (raw.startsWith('/') && !raw.startsWith('//') && !raw.includes('..')) ||
  (isHttpUrl(raw) && raw.startsWith('https://'));

const list = (raw: string, separator: RegExp) =>
  raw
    .split(separator)
    .map((item) => item.trim())
    .filter(Boolean);

/** Seconds from `34:31`, `1:02:03` or `2071`. */
export const parseDuration = (raw: string): number | null => {
  if (!raw) return null;
  return raw.split(':').reduce((total, part) => total * 60 + Number(part), 0);
};

/** `34:31` or `1:02:03`, the way the form shows a duration. */
export const formatDuration = (seconds: number | null | undefined) => {
  if (!seconds) return '';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = String(seconds % 60).padStart(2, '0');
  return hours ? `${hours}:${String(minutes).padStart(2, '0')}:${rest}` : `${minutes}:${rest}`;
};

/** A course's YouTube videos as embed URLs, the ones its player loads. */
const toEmbedUrl = (raw: string) => {
  if (/^https:\/\/www\.youtube(-nocookie)?\.com\/embed\//.test(raw)) return raw;
  const id = parseYoutubeId(raw);
  return id ? `https://www.youtube.com/embed/${id}` : null;
};

export const hostnameOf = (raw: string) => {
  try {
    return new URL(raw).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
};

/** The columns a Recommendation gets from the form, for one kind. */
export type RecommendationData = {
  title: string;
  description: string;
  url: string | null;
  author: string | null;
  coauthors: string[];
  source: string | null;
  categories: string[];
  language: 'es' | 'en' | null;
  publishedAt: Date | null;
  year: number | null;
  imageUrl: string | null;
  isbn: string | null;
  durationSeconds: number | null;
  hours: number | null;
  youtubeUrls: string[];
  isTalk: boolean;
  isMadeByCommunity: boolean;
  acceptDonations: boolean;
  note: string | null;
};

export type ParsedRecommendation =
  | { success: true; data: RecommendationData; youtubeId: string | null }
  | { success: false; error: string };

const fail = (error: string): ParsedRecommendation => ({ success: false, error });

/**
 * Validates the form for `kind` and turns it into columns. Fields the kind doesn't use are
 * dropped, and so are the admin-only ones unless `asAdmin`.
 */
export const parseRecommendation = (
  kind: RecommendationKindValue,
  input: unknown,
  { asAdmin = false } = {},
): ParsedRecommendation => {
  const parsed = recommendationFormSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? 'Datos inválidos');
  const allowed = new Set([...SUBMIT_FIELDS[kind], ...(asAdmin ? ADMIN_FIELDS[kind] : [])]);
  const values = Object.fromEntries(
    Object.entries(parsed.data).map(([field, value]) => [
      field,
      allowed.has(field as RecommendationFieldName)
        ? value
        : EMPTY_RECOMMENDATION_FORM[field as RecommendationFieldName],
    ]),
  ) as RecommendationFormValues;

  for (const field of REQUIRED_TO_SUBMIT[kind]) {
    if (!values[field]) return fail(`Completá ${fieldLabel(kind, field)}`);
  }

  let youtubeId: string | null = null;
  if (kind === 'VIDEO') {
    youtubeId = parseYoutubeId(values.url);
    if (!youtubeId) return fail('El link tiene que ser de un video de YouTube');
  } else if (values.url && !isHttpUrl(values.url)) {
    return fail('El link tiene que empezar con https://');
  }
  if (values.imageUrl && !isImageUrl(values.imageUrl)) {
    return fail('La imagen tiene que ser una URL https:// o un archivo del sitio (/...)');
  }

  const youtubeUrls: string[] = [];
  for (const raw of list(values.youtubeUrls, /\n+/)) {
    const embed = toEmbedUrl(raw);
    if (!embed) return fail(`No es un video de YouTube: ${raw}`);
    youtubeUrls.push(embed);
  }

  const publishedAt = values.publishedAt ? new Date(`${values.publishedAt}T00:00:00.000Z`) : null;
  if (publishedAt && Number.isNaN(publishedAt.getTime())) return fail('Fecha inválida');

  const source =
    values.source || (kind === 'ARTICLE' && values.url ? hostnameOf(values.url) : '') || null;

  return {
    success: true,
    youtubeId,
    data: {
      title: values.title,
      description: values.description,
      // A video's link is rebuilt from its id, so it's not kept.
      url: kind === 'VIDEO' ? null : values.url || null,
      author: values.author || null,
      coauthors: list(values.coauthors, /\s*,\s*/),
      source,
      categories: list(values.categories, /\s*,\s*/),
      language: kind === 'COURSE' ? null : values.language,
      publishedAt,
      year: values.year ? Number(values.year) : null,
      imageUrl: values.imageUrl || null,
      isbn: values.isbn ? values.isbn.replace(/-/g, '').toUpperCase() : null,
      durationSeconds: parseDuration(values.duration),
      hours: values.hours ? Number(values.hours) : null,
      youtubeUrls,
      isTalk: kind === 'VIDEO' && values.isTalk,
      isMadeByCommunity: kind === 'COURSE' && values.isMadeByCommunity,
      acceptDonations: kind === 'COURSE' && values.acceptDonations,
      note: values.note || null,
    },
  };
};

/**
 * What's still missing for an item to show up in its listing, as field labels. Empty when it
 * can be published.
 */
export const missingToPublish = (
  kind: RecommendationKindValue,
  item: Pick<
    RecommendationData,
    | 'title'
    | 'description'
    | 'url'
    | 'author'
    | 'source'
    | 'categories'
    | 'publishedAt'
    | 'durationSeconds'
    | 'youtubeUrls'
  >,
): string[] => {
  const missing: RecommendationFieldName[] = [];
  const need = (field: RecommendationFieldName, ok: unknown) => {
    if (!ok) missing.push(field);
  };
  need('title', item.title);
  if (kind === 'VIDEO') {
    need('source', item.source);
    need('publishedAt', item.publishedAt);
    need('duration', item.durationSeconds);
  } else {
    need('author', item.author);
    need('description', item.description);
  }
  if (kind === 'ARTICLE') {
    need('url', item.url);
    need('source', item.source);
    need('categories', item.categories.length);
    need('publishedAt', item.publishedAt);
  }
  if (kind === 'BOOK') need('categories', item.categories.length);
  if (kind === 'COURSE') need('url', item.url || item.youtubeUrls.length);
  return missing.map((field) => fieldLabel(kind, field));
};

/** The form's values for an existing item, to edit it. */
export const toRecommendationForm = (item: {
  url: string | null;
  slug: string;
  kind: RecommendationKindValue;
  title: string;
  author: string | null;
  coauthors: string[];
  source: string | null;
  categories: string[];
  language: string | null;
  publishedAt: Date | null;
  year: number | null;
  imageUrl: string | null;
  isbn: string | null;
  durationSeconds: number | null;
  hours: number | null;
  youtubeUrls: string[];
  description: string;
  isTalk: boolean;
  isMadeByCommunity: boolean;
  acceptDonations: boolean;
  note: string | null;
}): RecommendationFormValues => ({
  url: item.kind === 'VIDEO' ? `https://www.youtube.com/watch?v=${item.slug}` : (item.url ?? ''),
  title: item.title,
  author: item.author ?? '',
  coauthors: item.coauthors.join(', '),
  source: item.source ?? '',
  categories: item.categories.join(', '),
  language: item.language === 'en' ? 'en' : 'es',
  publishedAt: item.publishedAt ? new Date(item.publishedAt).toISOString().slice(0, 10) : '',
  year: item.year ? String(item.year) : '',
  imageUrl: item.imageUrl ?? '',
  isbn: item.isbn ?? '',
  duration: formatDuration(item.durationSeconds),
  hours: item.hours ? String(item.hours) : '',
  youtubeUrls: item.youtubeUrls.join('\n'),
  description: item.description,
  isTalk: item.isTalk,
  isMadeByCommunity: item.isMadeByCommunity,
  acceptDonations: item.acceptDonations,
  note: item.note ?? '',
});

/** A URL-friendly slug for a new course, article or book: `clean-code`, `nextjs`. */
export const slugify = (title: string) =>
  title
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/, '') || 'recomendacion';
