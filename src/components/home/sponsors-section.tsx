'use client';

import Link from 'next/link';
import { TextGenerateEffect } from '../ui/text-generate-effect';
import { Heading2 } from '../ui/heading-2';

export const SponsorsSection = () => {
  return (
    <div className="-mx-6 w-[calc(100%+3rem)] py-10">
      <div className="flex items-center justify-center p-6">
        <Heading2 className="relative z-10 text-center">Organizaciones que nos apoyan</Heading2>
      </div>

      <div className="grid grid-cols-1 gap-8 px-6 md:grid-cols-2">
        {/* ASZ Software */}
        <Link
          href="https://asz.software"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex flex-col items-center justify-center rounded-lg bg-neutral-900 p-6 transition-all hover:bg-neutral-800 hover:shadow-lg"
        >
          <div className="mb-4 flex flex-row items-center">
            <img src="/asz-software-logo-2.webp" alt="ASZ Studio" className="h-12" />
            <h1 className="ml-4 bg-gradient-to-b from-white to-gray-500 bg-clip-text text-2xl font-bold text-transparent md:text-3xl">
              ASZ Software
            </h1>
          </div>
          <TextGenerateEffect
            className="max-w-xl px-6 text-center text-base md:text-lg"
            words={'Top-quality software engineering studio.'}
          />
        </Link>

        {/* Bowery */}
        <Link
          href="https://bowerystudio.co/en/"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex flex-col items-center justify-center rounded-lg bg-neutral-900 p-6 transition-all hover:bg-neutral-800 hover:shadow-lg"
        >
          <div className="mb-4 flex flex-row items-center">
            <img src="/bowery-logo.webp" alt="Bowery" className="h-12" />
          </div>
          <TextGenerateEffect
            className="max-w-xl px-6 text-center text-base md:text-lg"
            words={'Elite squads for disruptive innovation.'}
          />
        </Link>

        {/* Eagerworks */}
        <Link
          href="https://eagerworks.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex flex-col items-center justify-center rounded-lg bg-neutral-900 p-6 transition-all hover:bg-neutral-800 hover:shadow-lg"
        >
          <div className="mb-4 flex flex-row items-center">
            <img src="/eagerworks-white-logo.svg" alt="Eagerworks" className="h-12" />
          </div>
          <TextGenerateEffect
            className="max-w-xl px-6 text-center text-base md:text-lg"
            words={'Building exceptional software solutions.'}
          />
        </Link>

        {/* IEEE Computer Society */}
        <Link
          href="https://www.computer.org/"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex flex-col items-center justify-center rounded-lg bg-neutral-900 p-6 transition-all hover:bg-neutral-800 hover:shadow-lg"
        >
          <div className="mb-4 flex flex-col items-center">
            <h1 className="bg-gradient-to-b from-white to-gray-500 bg-clip-text text-center text-xl font-bold text-transparent md:text-2xl">
              IEEE Computer Society
            </h1>
          </div>
          <TextGenerateEffect
            className="max-w-xl px-6 text-center text-base md:text-lg"
            words={'Advancing computing as a science and profession.'}
          />
        </Link>

        {/* Endpoint Consulting */}
        <Link
          href="https://www.instagram.com/endpointconsulting/"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex flex-col items-center justify-center rounded-lg bg-neutral-900 p-6 transition-all hover:bg-neutral-800 hover:shadow-lg"
        >
          <div className="mb-4 flex flex-col items-center">
            <h1 className="bg-gradient-to-b from-white to-gray-500 bg-clip-text text-center text-xl font-bold text-transparent md:text-2xl">
              Endpoint Consulting
            </h1>
          </div>
          <TextGenerateEffect
            className="max-w-xl px-6 text-center text-base md:text-lg"
            words={'Expertos en seguridad informática y consultoría tecnológica.'}
          />
        </Link>
      </div>
    </div>
  );
};
