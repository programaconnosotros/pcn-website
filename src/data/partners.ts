export type PartnerKind = 'empresa' | 'organizacion';

export interface Partner {
  name: string;
  kind: PartnerKind;
  url: string;
  logo: string;
  description: string;
  location: string;
  /** Show the partner name under the logo. */
  showName?: boolean;
  /** Dark logo on a transparent canvas; rendered as a white mark on the dark theme. */
  monochromeOnDark?: boolean;
}

export const partners: Partner[] = [
  {
    name: 'Dizenz',
    kind: 'empresa',
    url: 'https://dizenz.com',
    logo: '/dizenz-logo.webp',
    description: 'Modern Software Studio.',
    location: 'Tucumán, Argentina',
    showName: true,
  },
  {
    name: 'Xetro',
    kind: 'empresa',
    url: 'https://xetro.ai',
    logo: '/xetro-logo.png',
    description: 'AI Software Factory.',
    location: 'Tucumán, Argentina',
  },
  {
    name: 'Once57',
    kind: 'empresa',
    url: 'https://once57.com.ar',
    logo: '/once57-logo.PNG',
    description: 'Espacio de coworking moderno.',
    location: 'Tucumán, Argentina',
  },
  {
    name: 'UTN-FRT',
    kind: 'organizacion',
    url: 'https://www.frt.utn.edu.ar/',
    logo: '/utn-frt-logo.png',
    description: 'Universidad de ingeniería.',
    location: 'Tucumán, Argentina',
  },
  {
    name: 'Macch',
    kind: 'empresa',
    url: 'https://macch.ai/',
    logo: '/macch-white-logo.svg',
    description: 'IA para la atención al cliente y la operación de proveedores de internet.',
    location: 'Tucumán, Argentina',
  },
  {
    name: 'Crisol',
    kind: 'empresa',
    url: 'https://www.crisol.studio',
    logo: '/crisol-white-logo.svg',
    description:
      'Estudio de ingeniería: sistemas para procesos donde un error no se revierte, con la seguridad en la fundación.',
    location: 'Argentina',
  },
  {
    name: 'Blackbox Cowork',
    kind: 'empresa',
    url: 'https://www.instagram.com/blackboxcowork/',
    logo: '/blackbox-cowork-logo.png',
    description: 'Espacio de coworking adaptable.',
    location: 'Tucumán, Argentina',
    monochromeOnDark: true,
  },
  {
    name: 'Bowery',
    kind: 'empresa',
    url: 'https://choosebowery.com/',
    logo: '/bowery-logo-light.svg',
    description: 'Proveedor de ingenieros top en LATAM para empresas de primer nivel.',
    location: 'Buenos Aires, Argentina',
  },
  {
    name: 'Eagerworks',
    kind: 'empresa',
    url: 'https://eagerworks.com/',
    logo: '/eagerworks-white-logo.svg',
    description: 'Agencia de diseño y desarrollo de software.',
    location: 'Montevideo, Uruguay',
  },
  {
    name: 'Endpoint Consulting',
    kind: 'empresa',
    url: 'https://www.instagram.com/endpoint_ciberseguridad/',
    logo: '/endpoint-security-logo.png',
    description: 'Expertos en seguridad informática y consultoría tecnológica.',
    location: 'Tucumán, Argentina',
  },
  {
    name: 'IEEE Computer Society',
    kind: 'organizacion',
    url: 'https://www.computer.org/',
    logo: '/ieee-computer-society-logo.png',
    description:
      'Organización que busca promover la computación a través de publicaciones, estándares y conferencias.',
    location: 'IEEE CS Región Latinoamérica',
    monochromeOnDark: true,
  },
  {
    name: 'Cluster Tecnológico Tucumán',
    kind: 'organizacion',
    url: 'https://clustertucuman.org.ar/',
    logo: '/cluster-tecnologico-tucuman-logo.webp',
    description:
      'Asociación de empresas e instituciones que impulsan la industria del software en Tucumán.',
    location: 'Tucumán, Argentina',
    showName: true,
  },
  {
    name: 'SaltaDev',
    kind: 'organizacion',
    url: 'https://salta.dev/',
    logo: '/salta-dev-logo.webp',
    description: 'Comunidad de desarrolladores de Salta.',
    location: 'Salta, Argentina',
    showName: true,
  },
  {
    name: 'FormosaDev',
    kind: 'organizacion',
    url: 'https://www.instagram.com/formosa.dev.ar/',
    logo: '/formosa-dev-logo.webp',
    description: 'Comunidad de desarrolladores de Formosa.',
    location: 'Formosa, Argentina',
    showName: true,
  },
];

export const PARTNER_CONTACT_URL = 'https://wa.me/5493815777562';
