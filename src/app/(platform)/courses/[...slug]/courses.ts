type Course = {
  name: string;
  slug: string;
  description: string;
  youtubeUrls: Array<string>;
  teachedBy: string;
  acceptDonations: boolean;
  isMadeByCommunity: boolean;
};

const courses: Array<Course> = [
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
  },
  {
    name: 'Git & GitHub',
    slug: 'git-and-github',
    description:
      'Git permite que puedas controlar las versiones del código que desarrollas, y GitHub hace posible que puedas trabajar en equipo de una manera más eficiente. Este curso fue diseñado y dictado a los alumnos del primer año de ingeniería en sistemas de información, de la UTN-FRT.',
    youtubeUrls: ['https://www.youtube.com/embed/WlB2fzl1vO8?si=O3O4Mi-gU65x2eyJ&vq=hd1080'],
    teachedBy: 'Agustín Sánchez, Marcelo Núñez, Germán Navarro e Iván Taddei',
    acceptDonations: false,
    isMadeByCommunity: true,
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
  },
];

export const communityCourses = courses.filter((course) => course.isMadeByCommunity);

export const getCourseBySlug = (slug: string) => courses.find((course) => course.slug === slug);
