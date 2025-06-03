'use client';

import { InviteDevsToWork } from '@/components/home/invite-devs-to-work';
import { Heading2 } from '@/components/ui/heading-2';
import { MainSponsorCard } from '@components/home/main-sponsor-card';
import { MotivationalQuotes } from '@components/home/motivational-quotes';
import { Team } from '@components/landing/team';
import { Session, User } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Heading3 } from '@/components/ui/heading-3';
import { Paragraph } from '@/components/ui/paragraph';
import { BookOpen, Images, Linkedin, LogIn, ScrollText, UserPlus } from 'lucide-react';
import { Heading1 } from '@/components/ui/heading-1';
import Link from 'next/link';
import { GlassCardHover } from '@/components/home/glass-card-hover';
import { motion } from 'motion/react';
import { FlickeringGrid } from '@/components/magicui/flickering-grid';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Testimonials } from './testimonials';
import { Marquee } from '@/components/magicui/marquee';

const HomeClientSide = ({ session }: { session: (Session & { user: User }) | null }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="mt-6 md:max-w-screen-xl md:px-20"
    >
      <GlassCardHover />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 0.8,
          staggerChildren: 0.1,
        }}
        className="mb-6 border"
      >
        <div className="flex w-full flex-col items-center justify-center gap-2 border-b">
          {session ? (
            <>
              <Heading2 variant="gradient">
                {session?.user?.name ? `Hola ${session.user.name.split(' ')[0]}!` : 'Hola!'}
              </Heading2>

              <div className="hidden md:block">
                <MotivationalQuotes />
              </div>
            </>
          ) : (
            <div className="relative h-[500px] w-full overflow-hidden bg-background">
              <FlickeringGrid
                className="absolute inset-0 z-0 size-full"
                squareSize={4}
                gridGap={6}
                color="#6B7280"
                maxOpacity={0.2}
                flickerChance={0.1}
                height={800}
                width={1200}
              />

              <div className="absolute right-4 top-4 z-20">
                <ThemeToggle />
              </div>

              <div className="relative z-10 flex h-full flex-col items-center justify-center py-6">
                <div className="flex flex-col items-center">
                  <img src="/logo.webp" alt="programaConNosotros" width={100} height={100} />
                </div>

                <Heading1 className="mb-6 mt-8 font-mono dark:text-pcnGreen">
                  programaConNosotros
                </Heading1>

                <p className="text-center text-lg">
                  La comunidad que necesitas para llevar tu carrera
                  <br /> en la industria del software al siguiente nivel! 🚀
                </p>

                <div className="mt-3 flex flex-row gap-2 py-6">
                  <Link href="/autenticacion/registro">
                    <Button variant="outline">
                      Registrarme <UserPlus className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>

                  <Link href="/autenticacion/iniciar-sesion">
                    <Button>
                      Iniciar sesión <LogIn className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        <Testimonials />

        {/* TODO: Agregar sección de Lightning Talks */}

        <div className="border-b border-t">
          <div className="flex items-center justify-center p-6">
            <Heading2 className="relative z-10">El núcleo de la comunidad 💪</Heading2>
          </div>
        </div>

        <div className="grid grid-cols-2 border-b">
          <div className="group relative flex flex-col items-center border-b p-6">
            <div className="glass-card-gradient-hover absolute inset-0 z-0 bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(4,244,190,0.3),rgba(4,244,19,0))] opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(99,102,241,0.3),rgba(99,102,241,0))]"></div>
            <Heading3 className="relative z-10">Consejos</Heading3>

            <Paragraph className="relative z-10 text-center">
              Podés encontrar y compartir consejos con la comunidad. Queremos armar uno de los
              mejores repositorios de consejos sobre ingeniería de software en internet 💡
            </Paragraph>

            <Link href="/consejos" className="relative z-10">
              <Button variant="outline">
                Ver consejos <ScrollText className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="group relative flex flex-col items-center border-b border-l p-6">
            <div className="glass-card-gradient-hover absolute inset-0 z-0 bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(4,244,190,0.3),rgba(4,244,19,0))] opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(99,102,241,0.3),rgba(99,102,241,0))]"></div>
            <Heading3 className="relative z-10">Conocimiento</Heading3>

            <Paragraph className="relative z-10 text-center">
              Nos encanta dar charlas, cursos y compartir conocimiento con los demás. Tenemos muy
              claro que juntos llegamos más lejos 🤝
            </Paragraph>

            <div className="flex flex-row gap-2">
              <Link href="/charlas" className="relative z-10">
                <Button variant="outline">
                  Ver charlas <ScrollText className="ml-2 h-4 w-4" />
                </Button>
              </Link>

              <Link href="/cursos" className="relative z-10">
                <Button variant="outline">
                  Ver cursos <BookOpen className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
          <div className="group relative flex flex-col items-center border-b p-6">
            <div className="glass-card-gradient-hover absolute inset-0 z-0 bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(4,244,190,0.3),rgba(4,244,19,0))] opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(99,102,241,0.3),rgba(99,102,241,0))]"></div>
            <Heading3 className="relative z-10">Contactos</Heading3>

            <Paragraph className="relative z-10 text-center">
              Podés conocer personas apasionadas por el software de todo el mundo, de todas las
              áreas y de todos los niveles 🌎
            </Paragraph>
          </div>

          <div className="group relative flex flex-col items-center border-b border-l p-6">
            <div className="glass-card-gradient-hover absolute inset-0 z-0 bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(4,244,190,0.3),rgba(4,244,19,0))] opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(99,102,241,0.3),rgba(99,102,241,0))]"></div>
            <Heading3 className="relative z-10">Mentores</Heading3>

            <Paragraph className="relative z-10 text-center">
              Podés encontrar mentores de primer nivel y también convertirte en uno y ayudar a
              muchas personas 🫡
            </Paragraph>
          </div>

          <div className="group relative flex flex-col items-center p-6">
            <div className="glass-card-gradient-hover absolute inset-0 z-0 bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(4,244,190,0.3),rgba(4,244,19,0))] opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(99,102,241,0.3),rgba(99,102,241,0))]"></div>
            <Heading3 className="relative z-10">Oportunidades</Heading3>

            <Paragraph className="relative z-10 text-center">
              Muy seguido estamos compartiendo oportunidades soñadas para crecer en la industria del
              software 🚀
            </Paragraph>
          </div>

          <div className="group relative flex flex-col items-center border-l p-6">
            <div className="glass-card-gradient-hover absolute inset-0 z-0 bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(4,244,190,0.3),rgba(4,244,19,0))] opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(99,102,241,0.3),rgba(99,102,241,0))]"></div>
            <Heading3 className="relative z-10">Eventos</Heading3>

            <Paragraph className="relative z-10 text-center">
              Podés participar y organizar muchos eventos técnicos en los que podes aprender mucho,
              compartir tu conocimiento y conocer personas increíbles 🙌
            </Paragraph>
          </div>
        </div>

        <div className="text-center dark:border-b">
          <div className="group relative">
            <div className="glass-card-gradient-hover absolute inset-0 z-0 bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(4,244,190,0.3),rgba(4,244,19,0))] opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(99,102,241,0.3),rgba(99,102,241,0))]"></div>
            <div className="relative flex min-h-[400px] flex-col items-center justify-center bg-[url('/IMG_8959.webp')] bg-cover bg-center bg-no-repeat p-6">
              <div className="absolute inset-0 bg-black/70"></div>
              <Heading2 className="relative z-10 text-white">Conocé la historia de PCN</Heading2>

              <Paragraph className="relative z-10 text-center text-white">
                Te contamos por qué decidimos crear la comunidad y todos los pasos que hicimos para
                llegar a donde estamos hoy.
              </Paragraph>

              <Link href="/historia" className="relative z-10">
                <Button variant="outline">
                  Leer historia <ScrollText className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="text-center dark:border-b">
          <div className="group relative">
            <div className="glass-card-gradient-hover absolute inset-0 z-0 bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(4,244,190,0.3),rgba(4,244,19,0))] opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(99,102,241,0.3),rgba(99,102,241,0))]"></div>
            <div className="relative flex min-h-[400px] flex-col items-center justify-center bg-[url('/gallery-photos/talk-class.webp')] bg-cover bg-center bg-no-repeat p-6">
              <div className="absolute inset-0 bg-black/70"></div>
              <Heading2 className="relative z-10 text-white">Visita la galería de PCN</Heading2>

              <Paragraph className="relative z-10 text-center text-white">
                Conocé la comunidad o revisa algunos recuerdos en nuestra galería.
              </Paragraph>

              <Link href="/galeria" className="relative z-10">
                <Button variant="outline">
                  Ver galería <Images className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <MainSponsorCard />

        <InviteDevsToWork />
        <Team />

        <div className="border-t">
          <div className="flex items-center justify-center p-6">
            <Heading2 className="relative z-10">
              Sumate en todas las redes para aprovechar aún más! 🚀
            </Heading2>
          </div>
        </div>

        <div className="grid grid-cols-2 border-b border-t">
          <div className="group relative border-r p-6 text-center">
            <div className="glass-card-gradient-hover absolute inset-0 z-0 bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(4,244,190,0.3),rgba(4,244,19,0))] opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(99,102,241,0.3),rgba(99,102,241,0))]"></div>
            <Heading3 className="relative z-10">WhatsApp</Heading3>

            <Paragraph className="relative z-10 text-center">
              Tenemos un grupo muy activo en el que tenemos conversaciones muy interesantes, además
              de compartir oportunidades, consejos y mucho más.
            </Paragraph>

            <Button variant="outline" className="relative z-10">
              Entrar a la comunidad en WhatsApp
            </Button>
          </div>

          <div className="group relative p-6 text-center">
            <div className="glass-card-gradient-hover absolute inset-0 z-0 bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(4,244,190,0.3),rgba(4,244,19,0))] opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(99,102,241,0.3),rgba(99,102,241,0))]"></div>
            <Heading3 className="relative z-10">Discord</Heading3>

            <Paragraph className="relative z-10 text-center">
              En nuestro server hay canales de voz en los que podes charlar con otros miembros y
              también múltiples canales de texto y un foro con mucha data. Los eventos virtual los
              hacemos ahí.
            </Paragraph>

            <Button variant="outline" className="relative z-10">
              Entrar al server en Discord
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 border-b">
          <div className="group relative border-r p-6 text-center">
            <div className="glass-card-gradient-hover absolute inset-0 z-0 bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(4,244,190,0.3),rgba(4,244,19,0))] opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(99,102,241,0.3),rgba(99,102,241,0))]"></div>
            <Heading3 className="relative z-10">Instagram</Heading3>

            <Paragraph className="relative z-10 text-center">
              En Instagram subimos fotos de recuerdos y mucho contenido motivacional 💪
            </Paragraph>

            <Button variant="outline" className="relative z-10">
              Seguir en Instagram
            </Button>
          </div>

          <div className="group relative p-6 text-center">
            <div className="glass-card-gradient-hover absolute inset-0 z-0 bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(4,244,190,0.3),rgba(4,244,19,0))] opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(99,102,241,0.3),rgba(99,102,241,0))]"></div>
            <Heading3 className="relative z-10">YouTube</Heading3>

            <Paragraph className="relative z-10 text-center">
              Subimos videos de charlas, cursos y mucho más!
            </Paragraph>

            <Button variant="outline" className="relative z-10">
              Suscribirse a nuestro canal
            </Button>
          </div>
        </div>

        <div className="border-b text-center">
          <div className="group relative">
            <div className="glass-card-gradient-hover absolute inset-0 z-0 bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(4,244,190,0.3),rgba(4,244,19,0))] opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(99,102,241,0.3),rgba(99,102,241,0))]"></div>
            <div className="p-6">
              <Heading3 className="relative z-10">LinkedIn</Heading3>

              <Paragraph className="relative z-10 text-center">
                En LinkedIn le damos visibilidad a todo lo que hacemos para que te sirva en tu
                carrera laboral como justificación de tu gran pasión por el software 💪
              </Paragraph>

              <Link
                href="https://www.linkedin.com/company/programaconnosotros"
                className="relative z-10"
              >
                <Button variant="outline">
                  Seguir en LinkedIn <Linkedin className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default HomeClientSide;
