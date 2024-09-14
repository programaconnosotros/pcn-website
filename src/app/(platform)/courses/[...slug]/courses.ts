type Course = {
  name: string;
  slug: string;
  description: string;
  classes: Array<string>;
  teachedBy: string;
  acceptDonations: boolean;
};

const courses: Array<Course> = [
  {
    name: 'Vim',
    slug: 'vim',
    description:
      'Vim es un editor de texto avanzado que se utiliza principalmente en sistemas Unix.',
    classes: [
      'https://www.youtube.com/embed/C-C4xoCj_Lw?si=ik0XqUGkz4Xw7hZ4',
      'https://www.youtube.com/embed/0s1ccWvLGYw?si=ph1rPlNvBoobmbG8',
      'https://www.youtube.com/embed/9VIma5G-gUc?si=dHyZoKRqvc3Vpi0S',
      'https://www.youtube.com/embed/WVzklaR68PM?si=1b4QIepxrw44Tw45',
    ],
    teachedBy: 'Esteban Sánchez',
    acceptDonations: false,
  },
  {
    name: 'Git & GitHub',
    slug: 'git-and-github',
    description:
      'Git es un sistema de control de versiones distribuido que se utiliza para gestionar el código fuente de proyectos de software.',
    classes: ['https://www.youtube.com/embed/WlB2fzl1vO8?si=O3O4Mi-gU65x2eyJ&vq=hd1080'],
    teachedBy: 'Agustín Sánchez, Marcelo Núñez, Germán Navarro e Iván Taddei.',
    acceptDonations: false,
  },
];

export const getCourseBySlug = (slug: string) => courses.find((course) => course.slug === slug);
