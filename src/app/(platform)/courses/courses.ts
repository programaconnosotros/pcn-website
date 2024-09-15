export type Course = {
  name: string;
  slug: string;
  description: string;
  youtubeUrls: Array<string>;
  teachedBy: string;
  acceptDonations: boolean;
  isMadeByCommunity: boolean;
  date: Date;
};

export const communityCourses: Array<Course> = [
  {
    name: 'Git & GitHub',
    slug: 'git-and-github',
    description:
      'Git permite que puedas controlar las versiones del código que desarrollas, y GitHub hace posible que puedas trabajar en equipo de una manera más eficiente. Este curso fue diseñado y dictado a los alumnos del primer año de ingeniería en sistemas de información, de la UTN-FRT.',
    youtubeUrls: ['https://www.youtube.com/embed/WlB2fzl1vO8?si=O3O4Mi-gU65x2eyJ&vq=hd1080'],
    teachedBy: 'Agustín Sánchez, Marcelo Núñez, Germán Navarro e Iván Taddei',
    acceptDonations: false,
    isMadeByCommunity: true,
    date: new Date('2020-06-27'),
  },
  {
    name: 'Vim',
    slug: 'vim',
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
  },
  {
    name: 'LaTeX',
    slug: 'latex',
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
  },
];

export const externalCourses: Array<Course> = [
  {
    name: 'HTML & CSS',
    slug: 'html-and-css',
    description:
      'HTML y CSS son los lenguajes que nos permiten crear las páginas web que usamos todos los días. Este curso es una excelente introducción a estos lenguajes, y está recomendado para todos aquellos que quieran aprender a crear sus propias páginas web.',
    youtubeUrls: ['https://www.youtube.com/embed/ELSm-G201Ls?si=zKpbZY_bWWkw0xfx'],
    teachedBy: 'Dalto',
    acceptDonations: false,
    isMadeByCommunity: false,
    date: new Date('2024-01-01'),
  },
  {
    name: 'JavaScript',
    slug: 'javascript',
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
  },
];

export const getCourseBySlug = (slug: string) =>
  communityCourses.find((course) => course.slug === slug) ||
  externalCourses.find((course) => course.slug === slug);
