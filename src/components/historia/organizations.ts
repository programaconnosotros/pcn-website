import { partners } from '@/data/partners';

const partnerUrl = (name: string) => {
  const partner = partners.find((p) => p.name === name);
  if (!partner) throw new Error(`Partner not found: ${name}`);
  return partner.url;
};

/** Organizations and companies mentioned in /historia, linked to their sites. */
export const HISTORIA_ORGANIZATIONS = {
  'UTN-FRT': partnerUrl('UTN-FRT'),
  IEEE: 'https://www.ieee.org/',
  'IEEE Computer Society': partnerUrl('IEEE Computer Society'),
  Smalltalks: 'https://www.fast.org.ar/',
  'Tucumán Hacking': 'https://www.facebook.com/TucumanHacking/',
  'Endpoint Consulting': partnerUrl('Endpoint Consulting'),
  'Global Learning': 'https://ar.linkedin.com/company/globallearning-ar',
  Aticana: 'https://www.facebook.com/aticanaok/',
  'Instituto Nuestra Señora de Montserrat':
    'https://www.facebook.com/p/Instituto-Nuestra-Se%C3%B1ora-de-Montserrat-100064363732659/',
  'Blackbox Cowork': partnerUrl('Blackbox Cowork'),
  'Once57 Cowork': partnerUrl('Once57'),
  'Xetro AI': partnerUrl('Xetro'),
  'Vercel v0': 'https://v0.app/',
} as const;

export type HistoriaOrganizationName = keyof typeof HISTORIA_ORGANIZATIONS;
