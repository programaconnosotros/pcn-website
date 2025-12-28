'use client';

import Link from 'next/link';
import { Heading2 } from '../ui/heading-2';
import { Card, CardContent } from '../ui/card';

const sponsors = [
  {
    name: 'ASZ Software',
    url: 'https://asz.software',
    logo: '/asz-software-logo-2.webp',
    description: 'Estudio de software.',
    location: 'Tucumán, Argentina',
    hasLogo: true,
  },
  {
    name: 'Bowery',
    url: 'https://bowerystudio.co/en/',
    logo: '/bowery-logo-light.svg',
    description: 'Proveedor de ingenieros top en LATAM para empresas de primer nivel.',
    location: 'Buenos Aires, Argentina',
    hasLogo: true,
    showName: false,
  },
  {
    name: 'Eagerworks',
    url: 'https://eagerworks.com/',
    logo: '/eagerworks-white-logo.svg',
    description: 'Agencia de diseño y desarrollo de software.',
    location: 'Montevideo, Uruguay',
    hasLogo: true,
    showName: false,
  },
  {
    name: 'Blackbox Cowork',
    url: 'https://www.instagram.com/blackboxcowork/',
    description: 'Espacio de coworking adaptable.',
    location: 'Tucumán, Argentina',
    hasLogo: false,
  },
  {
    name: 'UTN-FRT',
    url: 'https://www.frt.utn.edu.ar/',
    logo: '/utn-frt-logo.png',
    description: 'Universidad de ingeniería.',
    location: 'Tucumán, Argentina',
    hasLogo: true,
    showName: false,
  },
  {
    name: 'IEEE Computer Society',
    url: 'https://www.computer.org/',
    logo: '/ieee-computer-society-logo.png',
    description: 'Organización que busca promover la computación a través de publicaciones, estándares y conferencias.',
    hasLogo: true,
    showName: false,
    whiteBg: true,
  },
  {
    name: 'Endpoint Consulting',
    url: 'https://www.instagram.com/endpointconsulting/',
    description: 'Expertos en seguridad informática y consultoría tecnológica.',
    location: 'Tucumán, Argentina',
    hasLogo: false,
  },
];

export const SponsorsSection = () => {
  return (
    <div className="-mx-6 w-[calc(100%+3rem)] py-10">
      <div className="flex items-center justify-center p-6">
        <Heading2 className="relative z-10 text-center">Nos acompañan</Heading2>
      </div>

      <div className="grid grid-cols-1 gap-6 px-6 md:grid-cols-2 lg:grid-cols-3">
        {sponsors.map((sponsor, index) => (
          <Link
            key={index}
            href={sponsor.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block"
          >
            <Card className="h-full border-2 border-transparent bg-gradient-to-br from-white to-gray-50 transition-all duration-300 hover:scale-[1.02] hover:border-pcnPurple hover:shadow-xl dark:border-neutral-900 dark:from-black dark:to-neutral-950 dark:hover:border-pcnGreen dark:hover:shadow-pcnGreen/20">
              <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                {sponsor.hasLogo ? (
                  <div
                    className={`mb-4 flex w-full items-center justify-center ${sponsor.name === 'Eagerworks' || sponsor.name === 'Bowery' || sponsor.name === 'ASZ Software' || sponsor.name === 'IEEE Computer Society' || sponsor.name === 'UTN-FRT' ? 'h-24' : 'h-16'} ${sponsor.name === 'Eagerworks' || sponsor.name === 'ASZ Software' || sponsor.name === 'Bowery' ? 'rounded-lg bg-black p-2' : ''} ${'whiteBg' in sponsor && sponsor.whiteBg ? 'rounded-lg bg-white p-2' : ''}`}
                  >
                    <img
                      src={sponsor.logo}
                      alt={sponsor.name}
                      className={`object-contain transition-transform duration-300 group-hover:scale-110 ${sponsor.name === 'Eagerworks' ? 'scale-150 group-hover:scale-[1.65]' : sponsor.name === 'ASZ Software' ? 'max-h-[5.5rem] w-auto' : sponsor.name === 'UTN-FRT' ? 'max-h-24 w-auto' : 'max-h-16 w-auto'}`}
                    />
                  </div>
                ) : (
                  <div className="mb-4 flex h-16 w-full items-center justify-center">
                    <h3 className="text-xl font-bold text-black dark:text-white md:text-2xl">
                      {sponsor.name}
                    </h3>
                  </div>
                )}
                {sponsor.hasLogo && sponsor.showName !== false && (
                  <h3 className="mb-2 text-lg font-semibold text-neutral-900 dark:text-white md:text-xl">
                    {sponsor.name}
                  </h3>
                )}
                <p className="text-sm text-muted-foreground dark:text-neutral-400 md:text-base">
                  {sponsor.description}
                </p>
                {sponsor.location && (
                  <p className="mt-2 text-xs text-muted-foreground dark:text-neutral-500">
                    {sponsor.location}
                  </p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};
