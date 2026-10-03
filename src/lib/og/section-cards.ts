import { communityCourses, externalCourses } from '@/app/(platform)/cursos/courses';
import { articles } from '@/app/(platform)/lectura/articles';
import { specialties } from '@/components/especialidades/specialties';
import { musicSets } from '@/components/music/music-sets';
import { videos } from '@/components/videos/videos';
import { conversations } from '@/data/whatsapp-conversations';
import { changelog } from '@/data/changelog';
import { TRACKS, trackQuestionCount } from '@/app/(platform)/entrevistas/questions';
import { renderTerminalCard } from './terminal-card';

// Community-wide public figures, the same ones the landing hero shows. Database counts only
// reflect platform accounts, so never use them here.
const MEMBERS = '500+ miembros';
const TALKS = '50+ charlas';
const EVENTS = '20+ eventos';

const totalQuestions = TRACKS.reduce((total, { id }) => total + trackQuestionCount(id), 0);

interface SectionCard {
  command: string;
  title: string;
  description: string;
  meta: string[];
}

// Only static data here: these cards are rendered at build time, without a database.
const SECTION_CARDS = {
  inicio: {
    command: 'whoami',
    title: 'programaConNosotros',
    description:
      'La comunidad de apasionados por la ingeniería de software. Eventos, charlas, cursos y mucho más, sin fronteras.',
    meta: [MEMBERS, TALKS, EVENTS],
  },
  eventos: {
    command: 'ls eventos/ --proximos',
    title: 'Eventos',
    description:
      'Meetups, coworks, Lightning Talks y Zero to Agent. Participá presencial u online junto a personas apasionadas por el software.',
    meta: [EVENTS, 'presencial y online'],
  },
  feed: {
    command: 'tail -f comunidad.log',
    title: 'Feed',
    description:
      'Lo que pasa en la comunidad: eventos nuevos, charlas, fotos, proyectos y conversaciones del grupo.',
    meta: [MEMBERS, 'actualizado todos los días'],
  },
  anuncios: {
    command: 'tail -f anuncios.log',
    title: 'Anuncios',
    description: 'Novedades, avisos y eventos de la comunidad programaConNosotros.',
    meta: ['novedades de la comunidad'],
  },
  changelog: {
    command: 'git log --oneline',
    title: 'Changelog',
    description: 'Los últimos cambios de la plataforma y quién de la comunidad los hizo.',
    meta: [`${changelog.filter((entry) => entry.audience !== 'admins').length} cambios`],
  },
  conversaciones: {
    command: 'cat whatsapp/*.md',
    title: 'Conversaciones',
    description:
      'Las mejores conversaciones del WhatsApp de la comunidad: debates técnicos, anécdotas y momentos memorables.',
    meta: [`${conversations.length} conversaciones`],
  },
  charlas: {
    command: 'ls charlas/',
    title: 'Charlas',
    description:
      'Charlas técnicas dadas por miembros de la comunidad sobre ingeniería de software, arquitectura, IA y mucho más.',
    meta: [TALKS, 'dadas por la comunidad'],
  },
  podcast: {
    command: 'play podcast.mp3',
    title: 'Podcast',
    description:
      'Conversaciones con referentes de la industria sobre ingeniería de software, arquitectura, IA y carrera profesional.',
    meta: ['producido por la comunidad'],
  },
  desarrollo: {
    command: 'git clone pcn-website',
    title: 'Desarrollá el proyecto',
    description:
      'El website de PCN es open source. Sumate al desarrollo, ganá experiencia real con un equipo y dejá tu huella.',
    meta: ['open source', 'Next.js · TypeScript'],
  },
  cursos: {
    command: 'ls cursos/',
    title: 'Cursos',
    description:
      'Cursos de ingeniería de software hechos y recomendados por la comunidad para crecer en tu carrera.',
    meta: [`${communityCourses.length + externalCourses.length} cursos`, 'gratis'],
  },
  lectura: {
    command: 'cat lecturas.md',
    title: 'Lectura',
    description:
      'Artículos y libros recomendados para leer sobre ingeniería de software. Llevá registro de lo que vas leyendo y marcá lo que te interesa leer.',
    meta: [`${articles.length} artículos`, 'libros'],
  },
  videos: {
    command: 'ls videos/',
    title: 'Videos',
    description:
      'Charlas de conferencias y videos sobre ingeniería de software que la comunidad recomienda ver.',
    meta: [`${videos.length} videos`],
  },
  especialidades: {
    command: 'man especialidades',
    title: 'Especialidades',
    description:
      'Una guía de las especialidades de la ingeniería de software para ayudarte a descubrir tu camino profesional.',
    meta: [`${specialties.length} especialidades`],
  },
  herramientas: {
    command: 'which herramientas',
    title: 'Herramientas',
    description:
      'Editores, terminales y herramientas de productividad que usamos a diario para programar mejor.',
    meta: ['recomendadas por la comunidad'],
  },
  proyectos: {
    command: 'ls proyectos/',
    title: 'Proyectos',
    description:
      'Proyectos de software creados por miembros de la comunidad: las tecnologías y las personas detrás de cada uno.',
    meta: ['hechos por la comunidad'],
  },
  entrevistas: {
    command: './simular-entrevista --active-recall',
    title: 'Entrevistas',
    description:
      'Simulá entrevistas de frontend, backend, AI engineering, agentic engineering, quality engineering, seguridad informática, diseño UX/UI con Figma, product engineering y project management para junior, semi-senior y senior.',
    meta: [`${totalQuestions} preguntas`, 'active recall'],
  },
  setups: {
    command: 'neofetch',
    title: 'Setups',
    description:
      'Los lugares de trabajo de la comunidad: escritorios, equipos y periféricos con los que programan los miembros.',
    meta: ['de la comunidad'],
  },
  consejos: {
    command: 'fortune',
    title: 'Consejos',
    description:
      'Consejos prácticos sobre ingeniería de software compartidos por miembros de la comunidad.',
    meta: ['de la comunidad'],
  },
  testimonios: {
    command: 'cat testimonios.txt',
    title: 'Testimonios',
    description:
      'Historias reales de miembros que crecieron junto a la comunidad y cómo PCN impactó en su carrera.',
    meta: [MEMBERS],
  },
  influencers: {
    command: 'follow --recomendados',
    title: 'Creadores de contenido',
    description:
      'Creadores de contenido sobre ingeniería de software que la comunidad recomienda seguir.',
    meta: ['curados por la comunidad'],
  },
  music: {
    command: 'play --shuffle',
    title: 'Música para programar',
    description: 'Radios de la comunidad y playlists recomendadas para programar concentrado.',
    meta: [`${musicSets.length} sets`],
  },
  'series-y-peliculas': {
    command: 'watch series-y-peliculas',
    title: 'Series y películas',
    description:
      'Series y películas sobre ingeniería de software y cultura tech recomendadas por la comunidad.',
    meta: ['recomendadas por la comunidad'],
  },
  'software-recomendado': {
    command: 'install --recomendado',
    title: 'Software recomendado',
    description:
      'Herramientas, apps y servicios probados y recomendados por miembros de programaConNosotros.',
    meta: ['probado por la comunidad'],
  },
  'preguntas-frecuentes': {
    command: 'pcn --help',
    title: 'Preguntas frecuentes',
    description:
      'Todo lo que necesitás saber sobre programaConNosotros: cómo unirte, cómo participar y qué ofrecemos.',
    meta: ['FAQ'],
  },
  historia: {
    command: 'git log --reverse',
    title: 'Nuestra historia',
    description:
      'Cómo nació programaConNosotros: de un grupo de estudiantes apasionados a una comunidad de ingeniería de software sin fronteras.',
    meta: ['desde 2020', MEMBERS],
  },
  miembros: {
    command: 'ls miembros/',
    title: 'Miembros',
    description:
      'Conocé a las personas de programaConNosotros: co-founders, ambassadors, speakers y quienes organizan eventos.',
    meta: [MEMBERS, TALKS, EVENTS],
  },
  logros: {
    command: 'achievements --list',
    title: 'Logros',
    description:
      'Badges que se desbloquean participando en la comunidad: dar charlas, organizar eventos, compartir proyectos, aportar código y más.',
    meta: [MEMBERS, 'badges para tu perfil'],
  },
  galeria: {
    command: 'open galeria/',
    title: 'Galería',
    description:
      'Fotos de meetups, conferencias y encuentros de la comunidad. Reviví los momentos que vivimos juntos.',
    meta: [EVENTS],
  },
  partners: {
    command: 'cat partners.txt',
    title: 'Partners',
    description:
      'Las empresas y organizaciones que apoyan a programaConNosotros y hacen posible que la comunidad crezca.',
    meta: ['gracias por el apoyo'],
  },
  usuarios: {
    command: 'who',
    title: 'Miembros',
    description: 'Conocé a las personas que forman programaConNosotros.',
    meta: [MEMBERS],
  },
  'code-warfare': {
    command: './code-warfare --start',
    title: 'Code Warfare',
    description: 'Competencias de programación de la comunidad programaConNosotros.',
    meta: ['próximamente'],
  },
} satisfies Record<string, SectionCard>;

export type SectionCardKey = keyof typeof SECTION_CARDS;

export const sectionCardAlt = (key: SectionCardKey) =>
  `${SECTION_CARDS[key].title} · programaConNosotros`;

export const renderSectionCard = (key: SectionCardKey) =>
  renderTerminalCard({ path: key === 'inicio' ? '' : key, ...SECTION_CARDS[key] });
