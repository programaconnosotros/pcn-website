// Shared vocabulary of the test case repository on /desarrollo/calidad: the areas of the site,
// and the shape of a test case. Both the hand-written manual cases and the generated automated
// ones (scripts/generate-automated-cases.mjs) use these area ids.

export const qualityAreas = [
  { id: 'auth', code: 'AUT', label: 'Autenticación', route: '/autenticacion' },
  { id: 'eventos', code: 'EVT', label: 'Eventos', route: '/eventos' },
  { id: 'charlas', code: 'CHA', label: 'Charlas', route: '/charlas' },
  { id: 'galeria', code: 'GAL', label: 'Galería', route: '/galeria' },
  { id: 'perfil', code: 'PER', label: 'Perfil y logros', route: '/perfil' },
  { id: 'consejos', code: 'CON', label: 'Consejos', route: '/consejos' },
  { id: 'testimonios', code: 'TES', label: 'Testimonios', route: '/testimonios' },
  { id: 'proyectos', code: 'PRO', label: 'Proyectos', route: '/proyectos' },
  { id: 'lectura', code: 'LEC', label: 'Lectura y marcas', route: '/lectura' },
  { id: 'conversaciones', code: 'CNV', label: 'Conversaciones', route: '/conversaciones' },
  { id: 'entrevistas', code: 'ENT', label: 'Entrevistas', route: '/entrevistas' },
  { id: 'notificaciones', code: 'NOT', label: 'Notificaciones', route: '/notificaciones' },
  { id: 'busqueda', code: 'BUS', label: 'Búsqueda y miembros', route: '/miembros' },
  { id: 'pcn-os', code: 'OS', label: 'PCN OS', route: '/' },
  { id: 'pwa', code: 'PWA', label: 'PWA y offline', route: '/offline' },
  { id: 'admin', code: 'ADM', label: 'Administración', route: '/admin' },
  { id: 'plataforma', code: 'PLT', label: 'Plataforma', route: '/' },
] as const;

export type QualityAreaId = (typeof qualityAreas)[number]['id'];

export type TestCaseType = 'manual' | 'automatizado';

export type TestCasePriority = 'alta' | 'media' | 'baja';

/** Where an automated test runs: a pure function, a server action, a route handler or a browser. */
export type AutomatedLayer = 'unit' | 'server-action' | 'route-handler' | 'integration' | 'e2e';

export type TestCase = {
  /** `TC-GAL-001` for manual cases, `TC-GAL-A001` for automated ones. */
  id: string;
  title: string;
  area: QualityAreaId;
  type: TestCaseType;
  priority: TestCasePriority;
  preconditions: string[];
  steps: string[];
  expected: string;
  /** Automated cases only: the test file and the full test name (describe › it). */
  automation?: { file: string; name: string; layer: AutomatedLayer };
};
