import Link from 'next/link';
import { GitHubSVG } from '../logos/GitHubSVG';
import { NextJsSVG } from '../logos/NextJsSVG';
import { ReactSVG } from '../logos/ReactSVG';
import { TailwindSVG } from '../logos/TailwindSVG';
import { TypescriptSVG } from '../logos/TypescriptSVG';
import GlassCard from './glass-card';
import { Heading3 } from '../ui/heading-3';

export const InviteDevsToWork = () => {
  return (
    <section className="rounded-md border px-10 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center gap-12 lg:flex-row">
          <div className="flex-1 text-white">
            <h2 className="mb-6 text-4xl font-bold">
              <span className="bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
                Colabora en este Proyecto!
              </span>
            </h2>

            <p className="mb-8 text-xl text-muted-foreground">
              ¿Te apasiona el desarrollo web? ¡Contribuye a este proyecto open-source y forma parte
              de una comunidad innovadora!
            </p>

            <div className="flex items-center gap-8">
              <div className="mb-10 flex-1">
                <Heading3 className="mb-4 text-primary dark:text-card-foreground">
                  Beneficios de Contribuir
                </Heading3>
                <ul className="space-y-3 [&>li]:text-muted-foreground">
                  <li className="flex items-center">
                    <span className="mr-2">🚀</span> Mejora tus habilidades con código real
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">💡</span> Aprende de otros desarrolladores
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">🌟</span> Construye tu portafolio
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">🤝</span> Sé parte de una comunidad global
                  </li>
                </ul>
              </div>

              <div className="hidden flex-1 lg:block">
                <div className="relative p-8">
                  <div className="absolute inset-0 rotate-6 transform rounded-xl bg-purple-500/10 shadow-xl"></div>
                  <div className="relative -rotate-3 transform rounded-xl bg-gray-800 p-8">
                    <div className="mockup-code bg-gray-900 p-2">
                      <pre className="text-green-400">
                        <code>{'>_'} Iniciando nuevo desafío...</code>
                      </pre>
                      <pre className="text-gray-400">
                        <code>{'>_'} Instalando conocimentos...</code>
                      </pre>
                      <pre className="text-blue-400">
                        <code>{'>_'} Buscando nuevos colegas...</code>
                      </pre>
                      <pre className="text-yellow-400">
                        <code>{'>_ Listo para comenzar?'} Y/N</code>
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-10">
              <Heading3 className="mb-6 text-primary dark:text-card-foreground">
                Nuestro Stack Tecnológico
              </Heading3>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4 [&>div>a]:text-primary dark:[&>div>a]:text-muted-foreground">
                <GlassCard className="p-0 md:p-6">
                  <Link
                    href={'https://nextjs.org/'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative z-10 flex flex-col items-center justify-center rounded-xl bg-card-foreground/10 p-8 shadow-xl backdrop-blur-md"
                  >
                    <NextJsSVG className="h-12 w-12" />
                    <span>Next.js</span>
                  </Link>
                </GlassCard>
                <GlassCard className="p-0 md:p-6">
                  <Link
                    href={'https://es.react.dev/'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative z-10 flex flex-col items-center justify-center rounded-xl bg-card-foreground/10 p-8 shadow-xl backdrop-blur-md"
                  >
                    <ReactSVG className="h-12 w-12" />
                    <span>React</span>
                  </Link>
                </GlassCard>
                <GlassCard className="p-0 md:p-6">
                  <Link
                    href={'https://www.typescriptlang.org/'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative z-10 flex flex-col items-center justify-center rounded-xl bg-card-foreground/10 p-8 shadow-xl backdrop-blur-md"
                  >
                    <TypescriptSVG className="h-12 w-12" />
                    <span>TypeScript</span>
                  </Link>
                </GlassCard>
                <GlassCard className="p-0 md:p-6">
                  <Link
                    href={'https://tailwindcss.com/'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative z-10 flex flex-col items-center justify-center rounded-xl bg-card-foreground/10 p-8 shadow-xl backdrop-blur-md"
                  >
                    <TailwindSVG className="h-12 w-12" />
                    <span>Tailwind</span>
                  </Link>
                </GlassCard>
              </div>
            </div>

            <div>
              <Heading3 className="mb-4 text-primary dark:text-card-foreground">
                ¿Cómo Contribuir?
              </Heading3>
              <p className="mb-6 text-muted-foreground">
                Visita nuestro repositorio en GitHub, explora los issues y envía tu primer PR. ¡Toda
                contribución cuenta!
              </p>
              <a
                href="https://github.com/programaconnosotros/pcn-website"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 dark:bg-pcnGreen dark:hover:bg-pcnGreen-900 md:w-max"
              >
                <GitHubSVG />
                Ver Repositorio
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
