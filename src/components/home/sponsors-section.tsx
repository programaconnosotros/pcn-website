'use client';

import Link from 'next/link';
import { Heading2 } from '../ui/heading-2';
import { Card, CardContent } from '../ui/card';

const sponsors = [
  {
    name: 'ASZ Software',
    url: 'https://asz.software',
    logo: '/asz-software-logo-2.webp',
    description: 'Estudio de ingeniería de software de alta calidad.',
    location: 'Tucumán, Argentina',
    hasLogo: true,
  },
  {
    name: 'Bowery',
    url: 'https://bowerystudio.co/en/',
    logo: '/bowery-logo.webp',
    description: 'Escuadrones de élite para innovación disruptiva.',
    location: 'Buenos Aires, Argentina',
    hasLogo: true,
    showName: false,
  },
  {
    name: 'Eagerworks',
    url: 'https://eagerworks.com/',
    logo: '/eagerworks-white-logo.svg',
    description: 'Construyendo soluciones de software excepcionales.',
    location: 'Montevideo, Uruguay',
    hasLogo: true,
    showName: false,
  },
  {
    name: 'IEEE Computer Society',
    url: 'https://www.computer.org/',
    description: 'Avanzando en la computación como ciencia y profesión.',
    location: 'Buenos Aires, Argentina',
    hasLogo: false,
  },
  {
    name: 'Endpoint Consulting',
    url: 'https://www.instagram.com/endpointconsulting/',
    description: 'Expertos en seguridad informática y consultoría tecnológica.',
    location: 'Tucumán, Argentina',
    hasLogo: false,
  },
  {
    name: 'UTN-FRT',
    url: 'https://www.frt.utn.edu.ar/',
    description: 'Universidad de ingeniería',
    location: 'Tucumán, Argentina',
    hasLogo: false,
  },
];

export const SponsorsSection = () => {
  return (
    <div className="-mx-6 w-[calc(100%+3rem)] py-10">
      <div className="flex items-center justify-center p-6">
        <Heading2 className="relative z-10 text-center">Organizaciones que nos apoyan</Heading2>
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
            <Card className="h-full transition-all duration-300 hover:scale-105 hover:shadow-xl dark:hover:shadow-pcnGreen/20 border-2 border-transparent hover:border-pcnPurple dark:hover:border-pcnGreen bg-gradient-to-br from-white to-gray-50 dark:from-neutral-900 dark:to-neutral-800 dark:border-neutral-800">
              <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                {sponsor.hasLogo ? (
                  <div className={`mb-4 flex h-16 w-full items-center justify-center ${sponsor.name === 'Eagerworks' || sponsor.name === 'ASZ Software' ? 'rounded-lg bg-black p-2' : ''}`}>
                    <img
                      src={sponsor.logo}
                      alt={sponsor.name}
                      className="max-h-16 w-auto object-contain transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                ) : (
                  <div className="mb-4 flex h-16 w-full items-center justify-center">
                    <h3 className="bg-gradient-to-br from-pcnPurple to-pcnBlue bg-clip-text text-2xl font-bold text-transparent dark:from-pcnGreen dark:to-pcnGreen/80 md:text-3xl">
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
