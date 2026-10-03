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
