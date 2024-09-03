import { auth } from '@/auth';
import { VortexHero } from '@/components/landing/vortex-hero';
import { ThemeToggle } from '@/components/themes/theme-toggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Users,
  MessageSquare,
  Rocket,
  Github,
  Lightbulb,
  Share2,
  UserPlus,
  Calendar,
} from 'lucide-react';
import Link from 'next/link';

export const Home = async () => {
  const session = await auth();

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <main className="flex-1">
        <VortexHero session={session} />

        <section className="w-full bg-gray-100 py-12 dark:bg-neutral-900 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <h2 className="mb-12 text-center text-3xl font-bold tracking-tighter sm:text-5xl">
              ¿Por qué deberías unirte?
            </h2>

            <div className="grid gap-6 lg:grid-cols-3 lg:gap-12">
              <Card>
                <CardContent className="flex flex-col items-center space-y-4 p-6">
                  <Users className="h-12 w-12 text-primary" />
                  <h3 className="text-center text-xl font-bold">Comunidad vibrante!</h3>

                  <p className="text-center text-gray-500 dark:text-gray-400">
                    Conectá con desarrolladores de todo el mundo, compartí ideas y colaborá en
                    proyectos.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex flex-col items-center space-y-4 p-6">
                  <MessageSquare className="h-12 w-12 text-primary" />
                  <h3 className="text-center text-xl font-bold">Intercambio de conocimiento</h3>

                  <p className="text-center text-gray-500 dark:text-gray-400">
                    Aprende de desarrolladores experimentados, participá en discusiones y crecé tus
                    habilidades.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex flex-col items-center space-y-4 p-6">
                  <Rocket className="h-12 w-12 text-primary" />
                  <h3 className="text-center text-xl font-bold">Oportunidades de carrera</h3>

                  <p className="text-center text-gray-500 dark:text-gray-400">
                    Descrubrí oportunidades laborales, mostrá tus proyectos y avanzá en tu carrera
                    en la tecnología.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <h2 className="mb-12 text-center text-3xl font-bold tracking-tighter sm:text-5xl">
              Actividades destacadas
            </h2>

            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
              <div className="flex flex-col space-y-4">
                <img
                  alt="Desarrollo open-source"
                  className="aspect-video overflow-hidden rounded-xl object-cover object-center"
                  height="310"
                  src="/motivation/eagerworks-1.jpeg"
                  width="550"
                />

                <h3 className="text-center text-2xl font-bold">Desarrollo open-source</h3>

                <p className="text-center text-gray-500 dark:text-gray-400">
                  Participá en el desarrollo de la plataforma que estás viendo en este momento,
                  sirve para intercambiar conocimiento, ganar experiencia y, sobre todo, para
                  divertirnos!
                </p>
              </div>

              <div className="flex flex-col space-y-4">
                <img
                  alt="Lightning Talks"
                  className="aspect-video overflow-hidden rounded-xl object-cover object-center"
                  height="310"
                  src="/lightning-talks/arquitectura-software.jpeg"
                  width="550"
                />

                <h3 className="text-center text-2xl font-bold">Lightning Talks</h3>

                <p className="text-center text-gray-500 dark:text-gray-400">
                  Jornada de charlas técnicas de corta duración para intercambiar conocimientos
                  interesantes de una forma entretenida, y aprovechar para conocer mucha gente
                  copada.
                </p>
              </div>

              <div className="flex flex-col space-y-4">
                <img
                  alt="Competencias de programación"
                  className="aspect-video overflow-hidden rounded-xl object-cover object-center"
                  height="310"
                  src="/IMG_2293.jpeg"
                  width="550"
                />

                <h3 className="text-center text-2xl font-bold">Code Warfare</h3>

                <p className="text-center text-gray-500 dark:text-gray-400">
                  Competencia de programación para que podamos divertirnos y poner a prueba nuestras
                  skills.
                </p>
              </div>

              <div className="flex flex-col space-y-4">
                <img
                  alt="Reuniones"
                  className="aspect-video overflow-hidden rounded-xl object-cover object-center"
                  height="310"
                  src="/juntada.jpeg"
                  width="550"
                />

                <h3 className="text-center text-2xl font-bold">
                  Reuniones presenciales y virtuales
                </h3>

                <p className="text-center text-gray-500 dark:text-gray-400">
                  Podés unirte a nuestros encuentros regulares para hacer networking, intercambiar
                  conocimiento y mantenerte actualizado con lo último en tecnología.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* TODO: Add section to show dynamic data (number of users, advises, activities, etc). */}

        <section className="w-full bg-gray-100 py-12 dark:bg-neutral-900 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <h2 className="mb-12 text-center text-3xl font-bold tracking-tighter sm:text-5xl md:px-40">
              Esto es lo que podés hacer en nuestra plataforma
            </h2>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="flex flex-col items-center space-y-4 p-6">
                  <Lightbulb className="h-12 w-12 text-primary" />
                  <h3 className="text-center text-xl font-bold">Compartir consejos</h3>

                  <p className="text-center text-gray-500 dark:text-gray-400">
                    Intercambia consejos valiosos de otros profesionales y estudiantes para mejorar
                    tus habilidades.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex flex-col items-center space-y-4 p-6">
                  <Share2 className="h-12 w-12 text-primary" />
                  <h3 className="text-center text-xl font-bold">Compartir motivación</h3>

                  <p className="text-center text-gray-500 dark:text-gray-400">
                    Inspira y motiva a otros miembros de la comunidad compartiendo tus experiencias
                    y logros.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex flex-col items-center space-y-4 p-6">
                  <UserPlus className="h-12 w-12 text-primary" />
                  <h3 className="text-center text-xl font-bold">Perfil profesional</h3>

                  <p className="text-center text-gray-500 dark:text-gray-400">
                    Crea y gestiona tu perfil profesional para destacar tus habilidades ante
                    potenciales empleadores.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex flex-col items-center space-y-4 p-6">
                  <Calendar className="h-12 w-12 text-primary" />
                  <h3 className="text-center text-xl font-bold">Actividades detalladas</h3>

                  <p className="text-center text-gray-500 dark:text-gray-400">
                    Accede a información detallada sobre nuestras actividades.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Sumate en Discord!
                </h2>

                <img alt="Discord" height="310" src="/discord-demo.png" />

                <p className="mx-auto max-w-[600px] text-gray-500 dark:text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Tenemos canales de texto y voz para que puedas interactuar con los miembros de la
                  comunidad, y un foro súper copado donde podes encontrar o compartir información
                  valiosa!
                </p>

                <p className="mx-auto max-w-[600px] text-gray-500 dark:text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Ya seas un desarrollador súper experimentado, o una persona que recién está
                  empezando a explorar el universo de la programación, todos son bienvenidos en
                  nuestra comunidad. Animate!
                </p>

                <Link href="https://discord.gg/dTQexKw56S" target="_blank">
                  <Button className="mt-8">Ir a Discord</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="flex w-full shrink-0 flex-row items-center justify-between gap-2 border-t px-4 py-6 sm:flex-row md:px-6">
        <div className="flex items-center gap-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            <code>programaConNosotros</code>
          </p>

          <div className="flex space-x-4">
            <Link
              href="https://github.com/programaconnosotros/pcn-website"
              className="text-gray-500 hover:text-gray-700"
            >
              <Github className="h-6 w-6" />
              <span className="sr-only">GitHub</span>
            </Link>
          </div>
        </div>

        <div className="flex justify-end">
          <ThemeToggle />
        </div>
      </footer>
    </div>
  );
};

export default Home;
