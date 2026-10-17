// Courses partners offer that the interview guides recommend, keyed by the guide they fit.

export interface RecommendedCourse {
  name: string;
  provider: string;
  /** Short, factual: what the course is about. */
  description: string;
  /** Where to enroll. */
  url: string;
}

const ENDPOINT = 'Endpoint Consulting';

export const endpointCourses: RecommendedCourse[] = [
  {
    name: 'Curso de Seguridad Ofensiva',
    provider: ENDPOINT,
    description: 'Pentesting y seguridad ofensiva, con un enfoque práctico.',
    url: 'https://forms.gle/NL3rD2JVhFrJX1B18',
  },
  {
    name: 'Curso de Blue Team',
    provider: ENDPOINT,
    description: 'Seguridad defensiva: monitoreo, detección y respuesta ante ataques.',
    url: 'https://forms.gle/Rgg9dak6ywNNUTS16',
  },
];

/** Endpoint's training catalog, for everything beyond the courses above. */
export const ENDPOINT_TRAININGS_URL = 'https://endpointsecurity.com.ar/capacitaciones';

/** Learning platforms the community recommends beyond single courses, shown on /cursos. */
export interface LearningPlatform {
  name: string;
  /** What you get, short and factual. */
  description: string;
  highlights: string[];
  url: string;
  /** How you pay for it. */
  pricing: string;
}

export const learningPlatforms: LearningPlatform[] = [
  {
    name: "O'Reilly Learning",
    description:
      "La biblioteca técnica más completa: casi todos los libros de O'Reilly y de unas 200 editoriales más (con títulos en early release), miles de horas de video, cursos en vivo con expertos y laboratorios para practicar.",
    highlights: ['libros y early releases', 'cursos en vivo', 'labs interactivos', 'videos'],
    url: 'https://www.oreilly.com/online-learning/',
    pricing: 'suscripción · prueba gratis',
  },
];
