'use client';

import Link from 'next/link';
import { Heading2 } from '../ui/heading-2';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Building2, Handshake, MessageSquare } from 'lucide-react';

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
    name: 'UTN-FRT',
    url: 'https://www.frt.utn.edu.ar/',
    logo: '/utn-frt-logo.png',
    description: 'Universidad de ingeniería.',
    location: 'Tucumán, Argentina',
    hasLogo: true,
    showName: false,
  },
  {
    name: 'Blackbox Cowork',
    url: 'https://www.instagram.com/blackboxcowork/',
    logo: '/blackbox-cowork-logo.jpeg',
    description: 'Espacio de coworking adaptable.',
    location: 'Tucumán, Argentina',
    hasLogo: true,
    showName: false,
  },
  {
    name: 'Endpoint Consulting',
    url: 'https://www.instagram.com/endpointconsulting/',
    logo: '/endpoint-security-logo.png',
    description: 'Expertos en seguridad informática y consultoría tecnológica.',
    location: 'Tucumán, Argentina',
    hasLogo: true,
    showName: false,
    blackBg: true,
  },
  {
    name: 'IEEE Computer Society',
    url: 'https://www.computer.org/',
    logo: '/ieee-computer-society-logo.png',
    description:
      'Organización que busca promover la computación a través de publicaciones, estándares y conferencias.',
    location: 'IEEE CS Región Latinoamérica',
    hasLogo: true,
    showName: false,
    whiteBg: true,
  },
];

export const SponsorsSection = () => {
  return (
    <div className="-mx-6 w-[calc(100%+3rem)] py-10">
      <div className="flex items-center justify-center p-6">
        <Heading2 className="relative z-10 mb-4 text-center text-3xl text-pcnPurple drop-shadow-[0_0_15px_rgba(80,56,189,0.4)] dark:text-pcnGreen dark:drop-shadow-[0_0_15px_rgba(4,244,190,0.8)] md:text-4xl">
          Sponsors
        </Heading2>
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
                    className={`mb-4 flex w-full items-center justify-center ${sponsor.name === 'UTN-FRT' || sponsor.name === 'Blackbox Cowork' ? 'h-32' : sponsor.name === 'Eagerworks' || sponsor.name === 'Bowery' || sponsor.name === 'ASZ Software' || sponsor.name === 'IEEE Computer Society' || sponsor.name === 'Endpoint Consulting' ? 'h-24' : 'h-16'} ${sponsor.name === 'Eagerworks' || sponsor.name === 'ASZ Software' || sponsor.name === 'Bowery' ? 'rounded-lg bg-black p-2' : ''} ${'whiteBg' in sponsor && sponsor.whiteBg ? 'rounded-lg bg-white p-2' : ''} ${'blackBg' in sponsor && sponsor.blackBg ? 'rounded-lg bg-black p-2' : ''}`}
                  >
                    <img
                      src={sponsor.logo}
                      alt={sponsor.name}
                      className={`object-contain transition-transform duration-300 group-hover:scale-110 ${sponsor.name === 'Eagerworks' ? 'max-h-10 w-auto' : sponsor.name === 'ASZ Software' ? 'max-h-[5.5rem] w-auto' : sponsor.name === 'UTN-FRT' ? 'max-h-32 w-auto rounded-lg' : sponsor.name === 'Blackbox Cowork' ? 'max-h-32 w-auto dark:invert' : 'max-h-16 w-auto'}`}
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
                  <h3 className="mb-2 text-2xl font-medium text-neutral-900 dark:text-white md:text-3xl">
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

        {/* Card para empresas que quieren sumarse */}
        <Link
          href="https://wa.me/5493815777562"
          target="_blank"
          rel="noopener noreferrer"
          className="group block"
        >
          <Card className="h-full border-2 border-dashed border-pcnPurple/50 bg-gradient-to-br from-pcnPurple/5 to-pcnPurple/10 transition-all duration-300 hover:scale-[1.02] hover:border-pcnPurple hover:shadow-xl dark:border-pcnGreen/50 dark:from-pcnGreen/5 dark:to-pcnGreen/10 dark:hover:border-pcnGreen dark:hover:shadow-pcnGreen/20">
            <CardContent className="flex h-full flex-col items-center justify-center p-6 text-center">
              <div className="mb-4 flex items-center justify-center gap-3">
                <Building2 className="h-8 w-8 text-pcnPurple dark:text-pcnGreen" strokeWidth={1.5} />
                <Handshake className="h-8 w-8 text-pcnPurple dark:text-pcnGreen" strokeWidth={1.5} />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-pcnPurple dark:text-pcnGreen md:text-xl">
                ¿Querés sumarte como sponsor?
              </h3>
              <p className="mb-4 text-sm text-muted-foreground dark:text-neutral-400 md:text-base">
                Sumate y ayudanos a impulsar personas apasionadas por el software.
              </p>
              <Button className="flex items-center gap-2 bg-pcnPurple text-white hover:bg-pcnPurple/90 dark:bg-pcnGreen dark:text-black dark:hover:bg-pcnGreen/90">
                <MessageSquare className="h-4 w-4" />
                Contactanos
              </Button>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
};
