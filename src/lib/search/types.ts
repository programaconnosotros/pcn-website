export type SearchResultType =
  | 'seccion'
  | 'evento'
  | 'curso'
  | 'charla'
  | 'video'
  | 'lectura'
  | 'conversacion'
  | 'especialidad'
  | 'consejo'
  | 'proyecto';

export interface SearchResult {
  type: SearchResultType;
  title: string;
  subtitle?: string;
  /** Site path, or an absolute URL for results that live elsewhere (e.g. projects). */
  href: string;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
}

/** Group headings, in the order groups are listed in the results. */
export const SEARCH_GROUPS: { type: SearchResultType; label: string }[] = [
  { type: 'seccion', label: 'secciones' },
  { type: 'evento', label: 'eventos' },
  { type: 'curso', label: 'cursos' },
  { type: 'charla', label: 'charlas' },
  { type: 'video', label: 'videos' },
  { type: 'lectura', label: 'lectura' },
  { type: 'especialidad', label: 'especialidades' },
  { type: 'conversacion', label: 'conversaciones' },
  { type: 'consejo', label: 'consejos' },
  { type: 'proyecto', label: 'proyectos' },
];
