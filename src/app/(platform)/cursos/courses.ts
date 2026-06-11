export type Course = {
  id: string;
  name: string;
  description: string;
  logo?: string;
  youtubeUrls?: Array<string>;
  websiteUrl?: string;
  teachedBy: string;
  acceptDonations: boolean;
  isMadeByCommunity: boolean;
  date: Date;
  hours?: number;
};

export const communityCourses: Array<Course> = [
  {
    name: 'Git & GitHub',
    id: 'git-and-github',
    logo: '/software-logos/github.webp',
    description:
      'Git permite que puedas controlar las versiones del código que desarrollas, y GitHub hace posible que puedas trabajar en equipo de una manera más eficiente. Este curso fue diseñado y dictado a los alumnos del primer año de ingeniería en sistemas de información, de la UTN-FRT.',
    youtubeUrls: ['https://www.youtube.com/embed/WlB2fzl1vO8?si=O3O4Mi-gU65x2eyJ&vq=hd1080'],
    teachedBy: 'Agustín Sánchez, Marcelo Núñez, Germán Navarro e Iván Taddei',
    acceptDonations: false,
    isMadeByCommunity: true,
    date: new Date('2020-06-27'),
    hours: 2,
  },
  {
    name: 'Vim',
    id: 'vim',
    logo: '/software-logos/vim.svg',
    description:
      'Aprendé a usar Vim, el editor de texto más poderoso del mundo. Vim permite editar y navegar código de una manera súper veloz. Podés usar Vim en la consola o instalar un plugin dentro de tu IDE favorito para agilizar tu codificación usando los atajos de teclado de Vim.',
    youtubeUrls: [
      'https://www.youtube.com/embed/C-C4xoCj_Lw?si=ik0XqUGkz4Xw7hZ4',
      'https://www.youtube.com/embed/0s1ccWvLGYw?si=ph1rPlNvBoobmbG8',
      'https://www.youtube.com/embed/9VIma5G-gUc?si=dHyZoKRqvc3Vpi0S',
      'https://www.youtube.com/embed/WVzklaR68PM?si=1b4QIepxrw44Tw45',
    ],
    teachedBy: 'Esteban Sánchez',
    acceptDonations: false,
    isMadeByCommunity: true,
    date: new Date('2020-10-12'),
    hours: 1,
  },
  {
    name: 'LaTeX',
    id: 'latex',
    logo: '/software-logos/latex.svg',
    description:
      'Aprende a usar LaTeX, el sistema de composición de textos más utilizado en la academia. LaTeX permite crear documentos que se ven profesionales y que se diferencian de los documentos de texto típicos, además de que podés editarlos utilizando código, permitiendo que uses tu tiempo en lo que importa: escribir tu documento.',
    youtubeUrls: [
      'https://www.youtube.com/embed/mYlqUGYp0_U?si=50HztuG6GLT1MI1J',
      'https://www.youtube.com/embed/OZtjjLzpyWE?si=fEafCnewwKCIjFEZ',
      'https://www.youtube.com/embed/ZzGJGiY0v70?si=ITMznfAjCBdRL2QT',
    ],
    teachedBy: 'Esteban Sánchez',
    acceptDonations: false,
    isMadeByCommunity: true,
    date: new Date('2020-12-31'),
    hours: 1,
  },
];

export const externalCourses: Array<Course> = [
  {
    name: 'HTML & CSS',
    id: 'html-and-css',
    logo: '/software-logos/html5.svg',
    description:
      'HTML y CSS son los lenguajes que nos permiten crear las páginas web que usamos todos los días. Este curso es una excelente introducción a estos lenguajes, y está recomendado para todos aquellos que quieran aprender a crear sus propias páginas web.',
    youtubeUrls: ['https://www.youtube.com/embed/ELSm-G201Ls?si=zKpbZY_bWWkw0xfx'],
    teachedBy: 'Dalto',
    acceptDonations: false,
    isMadeByCommunity: false,
    date: new Date('2024-01-01'),
    hours: 24,
  },
  {
    name: 'JavaScript',
    id: 'javascript',
    logo: '/language-logo/javascript-svgrepo-com.webp',
    description:
      'JavaScript es el lenguaje de programación que nos permite crear páginas web interactivas. Este curso es una excelente introducción a este lenguaje, y está recomendado para todos aquellos que quieran aprender a programar.',
    youtubeUrls: [
      'https://www.youtube.com/embed/z95mZVUcJ-E?si=IQ2RwTRAe2cLp754',
      'https://www.youtube.com/embed/xOinGb2MZSk?si=5CL18bgx-m8mURCf',
      'https://www.youtube.com/embed/EbMi1Qj4rVE?si=VZP36Vkh_qIW1kRt',
    ],
    teachedBy: 'Dalto',
    acceptDonations: false,
    isMadeByCommunity: false,
    date: new Date('2024-01-01'),
    hours: 27,
  },
  {
    name: 'Python',
    id: 'python',
    logo: '/software-logos/python.webp',
    description:
      'Python es un lenguaje de programación interpretado de alto nivel, que se utiliza para desarrollar aplicaciones web, scripts, y para la ciencia de datos. Este curso es una excelente introducción a este lenguaje, y está recomendado para todos aquellos que quieran aprender a programar.',
    youtubeUrls: [
      'https://www.youtube.com/embed/nKPbfIU442g?si=7qeAOJDvbDOHGJ3o',
      'https://www.youtube.com/embed/HtKqSJX7VoM?si=Emr_l0n_YORzfdt7',
    ],
    teachedBy: 'Dalto',
    acceptDonations: false,
    isMadeByCommunity: false,
    date: new Date('2023-01-22'),
    hours: 12,
  },
  {
    name: 'SQL',
    id: 'sql',
    logo: '/software-logos/sql.svg',
    description:
      'SQL es un lenguaje diseñado para administrar y recuperar información de sistemas de gestión de bases de datos relacionales.​',
    youtubeUrls: ['https://www.youtube.com/embed/OuJerKzV5T0?si=P_HyELgWxGfqW6hx'],
    teachedBy: 'Brais Moure',
    acceptDonations: false,
    isMadeByCommunity: false,
    date: new Date('2024-01-12'),
    hours: 7,
  },
  {
    name: 'Docker',
    id: 'docker',
    logo: '/software-logos/docker.webp',
    description:
      'Docker te permite empaquetar tus aplicaciones en contenedores para que corran igual en cualquier máquina. En este curso desde cero vas a aprender la teoría de los contenedores, la instalación, los comandos esenciales, Docker Compose y el uso de volúmenes para dejar una aplicación lista para correr.',
    youtubeUrls: ['https://www.youtube.com/embed/4Dko5W96WHg'],
    teachedBy: 'HolaMundo',
    acceptDonations: false,
    isMadeByCommunity: false,
    date: new Date('2026-01-01'),
    hours: 1,
  },
  {
    name: 'Hermes Agent',
    id: 'hermes-agent',
    logo: '/software-logos/hermes-agent.svg',
    description:
      'Hermes Agent es uno de los agentes de IA open source más avanzados y fáciles de usar: tiene memoria persistente, crea sus propias skills y trabaja de forma autónoma 24/7. En este tutorial vas a aprender a instalarlo, configurarlo y usarlo de forma profesional en un servidor VPS para tener tu propio asistente de IA personal que realmente aprende y trabaja por sí solo.',
    youtubeUrls: ['https://www.youtube.com/embed/gpbEfTQ1kLU'],
    teachedBy: 'Fazt',
    acceptDonations: false,
    isMadeByCommunity: false,
    date: new Date('2026-01-01'),
    hours: 1,
  },
  {
    name: 'Cursor',
    id: 'cursor',
    logo: '/software-logos/cursor.webp',
    description:
      'Cursor es uno de los editores de código con inteligencia artificial más potentes del momento. En este curso completo vas a aprender a usarlo desde cero hasta un nivel avanzado: el chat inteligente, el autocompletado, el Agent Mode, los distintos modelos de IA y los MCPs para integrar la IA en tu flujo de trabajo.',
    youtubeUrls: ['https://www.youtube.com/embed/bMmVZFd7HA4'],
    teachedBy: 'Fazt',
    acceptDonations: false,
    isMadeByCommunity: false,
    date: new Date('2026-01-01'),
    hours: 1,
  },
  {
    name: 'Claude Code',
    id: 'claude-code',
    logo: '/software-logos/claude-code.webp',
    description:
      'El curso más completo de Claude Code en español. Vas a pasar de no tener nada instalado a construir y desplegar proyectos reales con IA, sin necesidad de saber programar, cubriendo la instalación, el archivo CLAUDE.md, los Skills, las conexiones MCP y el deploy a internet con Vercel.',
    youtubeUrls: ['https://www.youtube.com/embed/73eFWU-edO4'],
    teachedBy: 'Benjamín Cordero',
    acceptDonations: false,
    isMadeByCommunity: false,
    date: new Date('2026-01-01'),
    hours: 3,
  },
  {
    name: 'Next.js',
    id: 'nextjs',
    logo: '/software-logos/nextjs.webp',
    description:
      'Aprendé Next.js, el framework de React para construir aplicaciones web full-stack. Es el curso oficial e interactivo: vas leyendo y practicando a tu propio ritmo mientras construís una aplicación real, cubriendo routing, renderizado, obtención de datos y más.',
    websiteUrl: 'https://nextjs.org/learn',
    teachedBy: 'Vercel',
    acceptDonations: false,
    isMadeByCommunity: false,
    date: new Date('2026-01-01'),
  },
  {
    name: 'Patterns.dev',
    id: 'patterns-dev',
    logo: '/software-logos/patterns-dev.png',
    description:
      'Patterns.dev es una guía gratuita sobre patrones de diseño y optimización del rendimiento para construir aplicaciones web modernas. Cubre patrones de diseño clásicos, patrones de renderizado y de rendimiento aplicados a JavaScript vanilla y React, ideal para mejorar la arquitectura de tus aplicaciones.',
    websiteUrl: 'https://www.patterns.dev/',
    teachedBy: 'Lydia Hallie & Addy Osmani',
    acceptDonations: false,
    isMadeByCommunity: false,
    date: new Date('2026-01-01'),
  },
];

export const getCourseById = (courseId: string) =>
  communityCourses.find((course) => course.id === courseId) ||
  externalCourses.find((course) => course.id === courseId);
