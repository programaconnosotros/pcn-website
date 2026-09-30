export interface Sponsor {
  name: string;
  url: string;
  logo: string;
  description: string;
  location: string;
  /** Show the sponsor name under the logo. */
  showName?: boolean;
  /** Dark logo on a transparent canvas; rendered as a white mark on the dark theme. */
  monochromeOnDark?: boolean;
}

export const sponsors: Sponsor[] = [
  {
    name: 'DIZENZ',
    url: 'https://dizenz.com',
    logo: '/dizenz-logo.webp',
    description: 'Modern Software Studio.',
    location: 'Tucumán, Argentina',
    showName: true,
  },
  {
    name: 'Xetro',
    url: 'https://xetro.ai',
    logo: '/xetro-logo.png',
    description: 'AI Software Factory.',
    location: 'Tucumán, Argentina',
  },
  {
    name: 'Once57',
    url: 'https://once57.com.ar',
    logo: '/once57-logo.PNG',
    description: 'Espacio de coworking moderno.',
    location: 'Tucumán, Argentina',
  },
  {
    name: 'UTN-FRT',
    url: 'https://www.frt.utn.edu.ar/',
    logo: '/utn-frt-logo.png',
    description: 'Universidad de ingeniería.',
    location: 'Tucumán, Argentina',
  },
  {
    name: 'Blackbox Cowork',
    url: 'https://www.instagram.com/blackboxcowork/',
    logo: '/blackbox-cowork-logo.png',
    description: 'Espacio de coworking adaptable.',
    location: 'Tucumán, Argentina',
    monochromeOnDark: true,
  },
  {
    name: 'Bowery',
    url: 'https://choosebowery.com/',
    logo: '/bowery-logo-light.svg',
    description: 'Proveedor de ingenieros top en LATAM para empresas de primer nivel.',
    location: 'Buenos Aires, Argentina',
  },
  {
    name: 'Eagerworks',
    url: 'https://eagerworks.com/',
    logo: '/eagerworks-white-logo.svg',
    description: 'Agencia de diseño y desarrollo de software.',
    location: 'Montevideo, Uruguay',
  },
  {
    name: 'Endpoint Consulting',
    url: 'https://www.instagram.com/endpoint_ciberseguridad/',
    logo: '/endpoint-security-logo.png',
    description: 'Expertos en seguridad informática y consultoría tecnológica.',
    location: 'Tucumán, Argentina',
  },
  {
    name: 'IEEE Computer Society',
    url: 'https://www.computer.org/',
    logo: '/ieee-computer-society-logo.png',
    description:
      'Organización que busca promover la computación a través de publicaciones, estándares y conferencias.',
    location: 'IEEE CS Región Latinoamérica',
    monochromeOnDark: true,
  },
];

export const SPONSOR_CONTACT_URL = 'https://wa.me/5493815777562';
