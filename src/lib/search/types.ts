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
  | 'foro'
  | 'proyecto'
  | 'perfil'
  | 'historia'
  | 'setup'
  | 'foto'
  | 'testimonio'
  | 'herramienta'
  | 'faq'
  | 'partner'
  | 'changelog';

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
  { type: 'perfil', label: 'perfiles' },
  { type: 'evento', label: 'eventos' },
  { type: 'conversacion', label: 'conversaciones' },
  { type: 'consejo', label: 'consejos' },
  { type: 'foro', label: 'foro' },
  { type: 'historia', label: 'historia' },
  { type: 'charla', label: 'charlas' },
  { type: 'curso', label: 'cursos' },
  { type: 'video', label: 'videos' },
  { type: 'lectura', label: 'lectura' },
  { type: 'especialidad', label: 'especialidades' },
  { type: 'herramienta', label: 'herramientas' },
  { type: 'setup', label: 'setups' },
  { type: 'foto', label: 'galería' },
  { type: 'testimonio', label: 'testimonios' },
  { type: 'proyecto', label: 'proyectos' },
  { type: 'faq', label: 'preguntas frecuentes' },
  { type: 'partner', label: 'partners' },
  { type: 'changelog', label: 'changelog' },
];

/** Every group, as a phrase for the loading state: "eventos, charlas, perfiles…". */
export const SEARCH_SCOPES = SEARCH_GROUPS.filter((group) => group.type !== 'seccion').map(
  (group) => group.label,
);
