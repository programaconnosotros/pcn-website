export const PROFILE_TABS = [
  { id: 'resumen', label: 'resumen' },
  { id: 'proyectos', label: 'proyectos' },
  { id: 'consejos', label: 'consejos' },
  { id: 'charlas', label: 'charlas' },
  { id: 'articulos', label: 'artículos' },
  { id: 'videos', label: 'videos' },
  { id: 'cursos', label: 'cursos' },
  { id: 'eventos', label: 'eventos' },
  { id: 'fotos', label: 'galería' },
  { id: 'setups', label: 'setups' },
  { id: 'trabajando', label: 'trabajando' },
  { id: 'conversaciones', label: 'conversaciones' },
  { id: 'contribuciones', label: 'contribuciones' },
] as const;

export type ProfileTab = (typeof PROFILE_TABS)[number]['id'];

export const isProfileTab = (value: unknown): value is ProfileTab =>
  PROFILE_TABS.some((tab) => tab.id === value);

export const profileTabHref = (userId: string, tab: ProfileTab) =>
  tab === 'resumen' ? `/perfil/${userId}` : `/perfil/${userId}?tab=${tab}`;
