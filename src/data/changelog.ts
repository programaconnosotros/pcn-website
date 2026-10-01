// Changes shipped to the platform, newest first, written for the people who use it. Authors are
// GitHub logins: /changelog links each one to the PCN profile an admin linked it to in /vinculos.
// Entries with `audience: 'admins'` describe admin-only tools and never reach other users.

export type ChangelogAudience = 'todos' | 'admins';

export interface ChangelogEntry {
  /** YYYY-MM-DD, the day it shipped. */
  date: string;
  /** Section of the site it touches, shown as a tag. */
  area: string;
  title: string;
  description: string;
  /** GitHub logins of whoever built it. */
  authors: string[];
  /** Where to see it. */
  href?: string;
  /** Defaults to everyone. */
  audience?: ChangelogAudience;
}

export const changelog: ChangelogEntry[] = [
  {
    date: '2026-10-01',
    area: 'changelog',
    title: 'Changelog de la plataforma',
    description:
      'Una página con los últimos cambios de la plataforma y quién los hizo, con link a su perfil.',
    authors: ['agustin-sanc'],
    href: '/changelog',
  },
  {
    date: '2026-10-01',
    area: 'os',
    title: 'Nuevo dock de PCN OS',
    description:
      'El dock ahora es una barra de comandos animada: los íconos se agrandan bajo el cursor, el prompt escribe el comando del programa y cada programa muestra su nombre al pasar el mouse.',
    authors: ['agustin-sanc'],
  },
  {
    date: '2026-10-01',
    area: 'charlas',
    title: 'Charlas de la comunidad renovadas',
    description:
      'Las charlas dadas por la comunidad se buscan, se recorren en una línea de tiempo por año y muestran los flyers completos.',
    authors: ['agustin-sanc'],
    href: '/charlas',
  },
  {
    date: '2026-10-01',
    area: 'conversaciones',
    title: 'Links directos a una conversación',
    description:
      'Un link a una conversación abre directamente su resumen en lugar de filtrar la lista.',
    authors: ['agustin-sanc'],
    href: '/conversaciones',
  },
  {
    date: '2026-10-01',
    area: 'entrevistas',
    title: 'Entrevistas de quality engineering',
    description: 'Nuevas entrevistas de testing manual y automatizado en el simulador.',
    authors: ['agustin-sanc'],
    href: '/entrevistas',
  },
  {
    date: '2026-09-30',
    area: 'entrevistas',
    title: 'Simulador de entrevistas técnicas',
    description:
      'Practicá entrevistas con active recall: una pregunta a la vez, 20 preguntas por entrevista, backends en Node, Python, Java y .NET, ingeniería de IA y agentes, y la opción de terminar cuando quieras.',
    authors: ['agustin-sanc'],
    href: '/entrevistas',
  },
  {
    date: '2026-09-30',
    area: 'proyectos',
    title: 'Publicá tus propios proyectos',
    description:
      'Los miembros pueden publicar sus proyectos, marcarlos como open source con su repo de GitHub y abrirlos dentro de PCN.',
    authors: ['agustin-sanc'],
    href: '/proyectos',
  },
  {
    date: '2026-09-30',
    area: 'proyectos',
    title: 'Orden de proyectos solo para admins',
    description:
      'Los proyectos nuevos se agregan al final y solo los admins pueden reordenar la lista.',
    authors: ['agustin-sanc'],
    href: '/proyectos',
    audience: 'admins',
  },
  {
    date: '2026-09-30',
    area: 'vinculos',
    title: 'Vínculos de identidades',
    description:
      'Asigná miembros de WhatsApp y logins de GitHub a usuarios de la plataforma, para que sus conversaciones y cambios lleven a su perfil.',
    authors: ['agustin-sanc'],
    href: '/vinculos',
    audience: 'admins',
  },
  {
    date: '2026-09-30',
    area: 'admin',
    title: 'Panel de administración en PCN OS',
    description:
      'Tablas compactas estilo terminal en las páginas de administración y una app Panel en el dock para admins.',
    authors: ['agustin-sanc'],
    href: '/admin',
    audience: 'admins',
  },
  {
    date: '2026-09-30',
    area: 'admin',
    title: 'Analíticas y monitoreo compactos',
    description: 'Los dashboards de analíticas y monitoreo muestran más datos en menos espacio.',
    authors: ['agustin-sanc'],
    href: '/analiticas',
    audience: 'admins',
  },
  {
    date: '2026-09-30',
    area: 'perfil',
    title: 'Perfiles con pestañas',
    description:
      'Los perfiles abren en un resumen, con una pestaña por sección: proyectos, charlas, conversaciones y más.',
    authors: ['agustin-sanc'],
  },
  {
    date: '2026-09-30',
    area: 'búsqueda',
    title: 'Búsqueda global con ⌘K',
    description:
      'Buscá eventos, cursos, charlas, conversaciones y más desde cualquier página con ⌘K.',
    authors: ['agustin-sanc'],
  },
  {
    date: '2026-09-30',
    area: 'ui',
    title: 'Atajos de teclado estilo vim',
    description: 'Navegá todas las páginas con el teclado.',
    authors: ['agustin-sanc'],
  },
  {
    date: '2026-09-30',
    area: 'videos',
    title: 'Videos recomendados',
    description:
      'Una página de videos recomendados por la comunidad, con la opción de marcar los que ya viste.',
    authors: ['agustin-sanc'],
    href: '/videos',
  },
  {
    date: '2026-09-30',
    area: 'charlas',
    title: 'Charlas externas recomendadas',
    description:
      'Una pestaña con charlas de conferencias recomendadas por la comunidad, como Next.js Conf y Rails World.',
    authors: ['agustin-sanc'],
    href: '/charlas',
  },
  {
    date: '2026-09-30',
    area: 'lectura',
    title: 'Lista "para leer"',
    description:
      'Marcá artículos como leídos o guardalos para después, y leelos en su sitio original sin salir de PCN.',
    authors: ['agustin-sanc'],
    href: '/lectura',
  },
  {
    date: '2026-09-30',
    area: 'cursos',
    title: 'Cursos renovados',
    description:
      'La lista de cursos tiene búsqueda, filtros y secciones; cada curso tiene un reproductor con playlist de clases y sugiere cursos y artículos relacionados.',
    authors: ['agustin-sanc'],
    href: '/cursos',
  },
  {
    date: '2026-09-30',
    area: 'música',
    title: 'Música en PCN OS',
    description:
      'Escuchá los sets y las radios de la comunidad desde la barra de menú de PCN OS mientras navegás.',
    authors: ['agustin-sanc'],
    href: '/music',
  },
  {
    date: '2026-09-30',
    area: 'eventos',
    title: 'Eventos en tu calendario',
    description:
      'Descargá un .ics de cada evento para agregarlo a cualquier calendario, además del link de Google Calendar.',
    authors: ['agustin-sanc'],
    href: '/eventos',
  },
  {
    date: '2026-09-30',
    area: 'feed',
    title: 'Feed RSS',
    description: 'Seguí las novedades de la comunidad desde tu lector de RSS.',
    authors: ['agustin-sanc'],
    href: '/feed.xml',
  },
  {
    date: '2026-09-30',
    area: 'os',
    title: 'PCN OS',
    description:
      'En pantallas grandes la plataforma se convierte en un escritorio: cada sección abre en su propia ventana, con dock, barra de menú y lanzador de programas.',
    authors: ['agustin-sanc'],
  },
  {
    date: '2026-09-30',
    area: 'ui',
    title: 'Nuevo look de terminal',
    description:
      'Todo el sitio pasó a un estilo de terminal: tipografía Geist, paleta verde fósforo, listas compactas y navegación móvil con barra inferior.',
    authors: ['agustin-sanc'],
  },
  {
    date: '2026-09-30',
    area: 'conversaciones',
    title: 'Conversaciones como log de terminal',
    description:
      'Las conversaciones se leen como un log, con un lector de resúmenes y 169 conversaciones nuevas de junio a septiembre.',
    authors: ['agustin-sanc'],
    href: '/conversaciones',
  },
  {
    date: '2026-09-30',
    area: 'desarrollo',
    title: 'Estadísticas de colaboración en vivo',
    description:
      'La página de desarrollo muestra commits, PRs y contribuidores del repo, actualizados desde GitHub.',
    authors: ['agustin-sanc'],
    href: '/desarrollo',
  },
  {
    date: '2026-09-29',
    area: 'eventos',
    title: 'Eventos en Google Calendar',
    description: 'Agregá cualquier evento a tu Google Calendar desde su página.',
    authors: ['facmartoni'],
    href: '/eventos',
  },
  {
    date: '2026-09-29',
    area: 'eventos',
    title: 'Varios flyers por evento',
    description:
      'Subí varias imágenes de flyer a la vez y reordenalas en el formulario del evento.',
    authors: ['agustin-sanc'],
    href: '/eventos',
    audience: 'admins',
  },
  {
    date: '2026-09-29',
    area: 'inicio',
    title: 'Nueva página de inicio',
    description: 'Rediseño de la landing y de la barra lateral.',
    authors: ['agustin-sanc'],
    href: '/',
  },
  {
    date: '2026-09-11',
    area: 'sponsors',
    title: 'Sponsors en la barra lateral',
    description: 'La página de sponsors ahora está en la sección Comunidad de la barra lateral.',
    authors: ['MaxiR23'],
    href: '/sponsors',
  },
];
