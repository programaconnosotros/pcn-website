// Filters of the gallery, kept in the URL so every view can be shared and browsed:
// `?tipo=fotos|videos&evento=<id>&persona=<userId>`. The item page receives the same params so
// prev/next stays within the filtered set.

export const GALLERY_TYPES = [
  { value: 'todo', label: 'todo' },
  { value: 'fotos', label: 'fotos' },
  { value: 'videos', label: 'videos' },
] as const;

export type GalleryType = (typeof GALLERY_TYPES)[number]['value'];

export type GalleryFilter = { type: GalleryType; eventId?: string; userId?: string };

type SearchParams = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined) =>
  (Array.isArray(value) ? value[0] : value) || undefined;

export function parseGalleryFilter(params: SearchParams): GalleryFilter {
  const tipo = first(params.tipo);
  return {
    type: tipo === 'fotos' || tipo === 'videos' ? tipo : 'todo',
    eventId: first(params.evento),
    userId: first(params.persona),
  };
}

/** `?tipo=videos&evento=…`, or '' when nothing is filtered. */
export function galleryQuery(filter: Partial<GalleryFilter>) {
  const params = new URLSearchParams();
  if (filter.type && filter.type !== 'todo') params.set('tipo', filter.type);
  if (filter.eventId) params.set('evento', filter.eventId);
  if (filter.userId) params.set('persona', filter.userId);
  const query = params.toString();
  return query ? `?${query}` : '';
}

export const isFiltered = (filter: GalleryFilter) =>
  filter.type !== 'todo' || !!filter.eventId || !!filter.userId;

/** `1:05`, `12:30`, `1:02:03`. */
export function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = String(seconds % 60).padStart(2, '0');
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`;
}
