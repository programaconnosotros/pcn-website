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
import {
  Brain,
  Calendar,
  Globe,
  Handshake,
  Images,
  Linkedin,
  LogIn,
  MicVocal,
  MonitorPlay,
  ScrollText,
  UserPlus,
  Users,
} from 'lucide-react';
import { Heading1 } from '@/components/ui/heading-1';
import Image from 'next/image';
import Link from 'next/link';
import { GlassCardHover } from '@/components/home/glass-card-hover';
import { motion } from 'motion/react';
import { FlickeringGrid } from '@/components/magicui/flickering-grid';
import { ThemeToggle } from '@/components/ui/theme-toggle';

const HomeClientSide = ({ session }: { session: (Session & { user: User }) | null }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      <GlassCardHover />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 0.8,
          staggerChildren: 0.1,
        }}
        className="mb-6"
      >
        {session ? (
          <div className="relative -mx-6 mb-6 flex min-h-[400px] w-[calc(100%+3rem)] flex-col items-center justify-center gap-2 overflow-hidden p-4 md:p-12">
            {/* Background GIF */}
            <div className="absolute inset-0 z-0">
              <Image
                src="/home.GIF"
                alt="Background"
                fill
                className="object-cover"
                priority
                unoptimized
              />
            </div>
            
            {/* Overlay for better text readability */}
            <div className="absolute inset-0 z-0 bg-black/70" />
            
            <Heading2 className="relative z-10 text-center text-white">
              {session?.user?.name
                ? `Hola ${session.user.name.split(' ')[0]}! Gracias por ser parte de la comunidad.`
                : 'Hola!'}
            </Heading2>

            {/* <div className="hidden md:block">
              <MotivationalQuotes />
            </div> */}
          </div>
        ) : (
          // Componente usuario no logueado
          <div className="relative -mx-4 min-h-[400px] w-[calc(100%+2rem)] overflow-hidden bg-background pt-12 md:-mx-20 md:h-[500px] md:w-[calc(100%+10rem)] md:pt-0">
            <div
              className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: "url('/pcn-header.webp')",
              }}
            />
            <div className="absolute inset-0 z-0 bg-black/60" />

            <div className="absolute right-4 top-4 z-20">
              <ThemeToggle />
            </div>

            <div className="relative z-10 flex h-full w-full flex-col items-center justify-center px-4 py-6">
              <div className="flex flex-col items-center">
                <img src="/logo.webp" alt="programaConNosotros" className="w-[50px] md:w-[100px]" />
              </div>

              <Heading1 className="mb-4 mt-6 text-center font-mono text-2xl text-pcnGreen md:mb-6 md:mt-8 md:text-4xl">
                programaConNosotros
              </Heading1>

              <p className="px-4 text-center text-base leading-relaxed text-white md:text-lg">
                La comunidad que necesitas para llevar tu carrera
                <br className="hidden md:block" />
                <span className="md:hidden"> </span>
                en la industria del software al siguiente nivel!
              </p>

              <div className="mt-6 flex w-full max-w-sm flex-col gap-3 px-4 md:mt-3 md:max-w-none md:flex-row md:justify-center md:gap-2 md:px-0 md:py-6">
                <Link href="/autenticacion/registro" className="w-full md:w-auto">
                  <Button className="w-full text-sm md:w-auto md:text-base">
                    Registrarme <UserPlus className="ml-2 h-4 w-4" />
                  </Button>
                </Link>

                <Link href="/autenticacion/iniciar-sesion" className="w-full md:w-auto">
                  <Button variant="outline" className="w-full text-sm md:w-auto md:text-base">
                    Iniciar sesión <LogIn className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* <Testimonials /> */}

        {/* TODO: Agregar sección de Lightning Talks */}

        <div className="flex items-center justify-center p-6">
          <Heading2 className="relative z-10 mb-6 text-center md:text-left">
            Impulsá tu carrera con estos recursos
          </Heading2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <div className="group relative flex flex-col items-center p-6">
            <div className="glass-card-gradient-hover absolute inset-0 z-0 bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(4,244,190,0.3),rgba(4,244,19,0))] opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(4,244,190,0.3),rgba(4,244,190,0))]"></div>
            <div className="relative z-10 mb-4 flex justify-center">
              <Handshake className="h-10 w-10 md:h-12 md:w-12" strokeWidth={1.0} />
            </div>
            <Heading3 className="relative z-10">Consejos</Heading3>

            <Paragraph className="relative z-10 text-center text-muted-foreground">
              Podés encontrar y compartir consejos con la comunidad. Queremos armar uno de los
              mejores repositorios de consejos sobre ingeniería de software en internet.
            </Paragraph>

            <Link href="/consejos" className="relative z-10">
              <Button>
                Ver consejos
              </Button>
            </Link>
          </div>

          <div className="group relative flex flex-col items-center p-6">
            <div className="glass-card-gradient-hover absolute inset-0 z-0 bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(4,244,190,0.3),rgba(4,244,19,0))] opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(4,244,190,0.3),rgba(4,244,190,0))]"></div>
            <div className="relative z-10 mb-4 flex justify-center">
              <MicVocal className="h-10 w-10 md:h-12 md:w-12" strokeWidth={1.0} />
            </div>
            <Heading3 className="relative z-10">Charlas</Heading3>

            <Paragraph className="relative z-10 text-center text-muted-foreground">
              Nos encanta dar charlas para compartir conocimiento. Tenemos una página para
              guardar el historial, las diapositivas y algunas charlas que quedaron grabadas.
            </Paragraph>

            <div className="flex flex-col gap-2 md:flex-row">
              <Link href="/charlas" className="relative z-10">
                <Button>
                  Ver charlas
                </Button>
              </Link>
            </div>
          </div>

          <div className="group relative flex flex-col items-center p-6">
            <div className="glass-card-gradient-hover absolute inset-0 z-0 bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(4,244,190,0.3),rgba(4,244,19,0))] opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(4,244,190,0.3),rgba(4,244,190,0))]"></div>
            <div className="relative z-10 mb-4 flex justify-center">
              <Users className="h-10 w-10 md:h-12 md:w-12" strokeWidth={1.0} />
            </div>
            <Heading3 className="relative z-10">Contactos</Heading3>

            <Paragraph className="relative z-10 text-center text-muted-foreground">
              Podés conocer personas apasionadas por el software de todo el mundo, de todas las
              áreas y de todos los niveles.
            </Paragraph>

            <Link href="/consejos" className="relative z-10">
              <Button>
                Conocer a la comunidad
              </Button>
            </Link>
          </div>

          <div className="group relative flex flex-col items-center p-6">
            <div className="glass-card-gradient-hover absolute inset-0 z-0 bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(4,244,190,0.3),rgba(4,244,19,0))] opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(4,244,190,0.3),rgba(4,244,190,0))]"></div>
            <div className="relative z-10 mb-4 flex justify-center">
              <Brain className="h-10 w-10 md:h-12 md:w-12" strokeWidth={1.0} />
            </div>
            <Heading3 className="relative z-10">Mentores</Heading3>

            <Paragraph className="relative z-10 text-center text-muted-foreground">
              Podés encontrar mentores de primer nivel y también convertirte en uno para ayudar a
              muchas personas en su crecimiento profesional.
            </Paragraph>

            <Link href="/mentores" className="relative z-10">
              <Button>
                Conocer mentores
              </Button>
            </Link>
          </div>

          <div className="group relative flex flex-col items-center p-6">
            <div className="glass-card-gradient-hover absolute inset-0 z-0 bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(4,244,190,0.3),rgba(4,244,19,0))] opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(4,244,190,0.3),rgba(4,244,190,0))]"></div>
            <div className="relative z-10 mb-4 flex justify-center">
              <Globe className="h-10 w-10 md:h-12 md:w-12" strokeWidth={1.0} />
            </div>
            <Heading3 className="relative z-10">Oportunidades</Heading3>

            <Paragraph className="relative z-10 text-center text-muted-foreground">
              Muy seguido estamos compartiendo oportunidades soñadas para crecer en la industria del
              software y avanzar en tu carrera profesional.
            </Paragraph>

            <div className="flex flex-col gap-2 md:flex-row">
              <Link href="https://chat.whatsapp.com/IFwKhHXoMwM6ysKcbfHiEh" target="_blank">
                <Button className="relative z-10 w-full md:w-auto">PCN en WhatsApp</Button>
              </Link>

              <Link href="https://discord.gg/dTQexKw56S" target="_blank">
                <Button className="relative z-10 w-full md:w-auto">PCN en Discord</Button>
              </Link>
            </div>
          </div>

          <div className="group relative flex flex-col items-center p-6">
            <div className="glass-card-gradient-hover absolute inset-0 z-0 bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(4,244,190,0.3),rgba(4,244,19,0))] opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(4,244,190,0.3),rgba(4,244,190,0))]"></div>
            <div className="relative z-10 mb-4 flex justify-center">
              <Calendar className="h-10 w-10 md:h-12 md:w-12" strokeWidth={1.0} />
            </div>
            <Heading3 className="relative z-10">Eventos</Heading3>

            <Paragraph className="relative z-10 text-center text-muted-foreground">
              Podés participar y organizar muchos eventos técnicos en los que podes aprender mucho,
              compartir tu conocimiento y conocer personas increíbles.
            </Paragraph>

            <Link href="/eventos" className="relative z-10">
              <Button>
                Ver eventos
              </Button>
            </Link>
          </div>
        </div>

        <div className="text-center -mx-6 w-[calc(100%+3rem)]">
          <div className="group relative">
            <div className="glass-card-gradient-hover absolute inset-0 z-0 bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(4,244,190,0.3),rgba(4,244,19,0))] opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(4,244,190,0.3),rgba(4,244,190,0))]"></div>

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

        <div className="text-center -mx-6 w-[calc(100%+3rem)]">
          <div className="group relative">
            <div className="glass-card-gradient-hover absolute inset-0 z-0 bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(4,244,190,0.3),rgba(4,244,19,0))] opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(4,244,190,0.3),rgba(4,244,190,0))]"></div>

            <div className="relative flex min-h-[400px] flex-col items-center justify-center bg-[url('/photos/talk-class.webp')] bg-cover bg-center bg-no-repeat p-6">
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

        <InviteDevsToWork />
        <Team />

        <div className="flex items-center justify-center p-6">
          <Heading2 className="relative z-10 text-center">
            Sumate en todas las redes para aprovechar aún más! 🚀
          </Heading2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <div className="group relative p-6 text-center">
            <div className="glass-card-gradient-hover absolute inset-0 z-0 bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(4,244,190,0.3),rgba(4,244,19,0))] opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(4,244,190,0.3),rgba(4,244,190,0))]"></div>
            <Heading3 className="relative z-10">WhatsApp</Heading3>

            <Paragraph className="relative z-10 text-center">
              Tenemos un grupo muy activo en el que tenemos conversaciones muy interesantes, además
              de compartir oportunidades, consejos y mucho más.
            </Paragraph>

            <Link href="https://chat.whatsapp.com/IFwKhHXoMwM6ysKcbfHiEh" target="_blank">
              <Button className="relative z-10 w-full md:w-auto">Abrir WhatsApp</Button>
            </Link>
          </div>

          <div className="group relative p-6 text-center">
            <div className="glass-card-gradient-hover absolute inset-0 z-0 bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(4,244,190,0.3),rgba(4,244,19,0))] opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(4,244,190,0.3),rgba(4,244,190,0))]"></div>
            <Heading3 className="relative z-10">Discord</Heading3>

            <Paragraph className="relative z-10 text-center">
              En nuestro server hay canales de voz en los que podes charlar con otros miembros y
              también múltiples canales de texto y un foro con mucha data. Los eventos virtual los
              hacemos ahí.
            </Paragraph>

            <Link href="https://discord.gg/dTQexKw56S" target="_blank">
              <Button className="relative z-10 w-full md:w-auto">Abrir Discord</Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <div className="group relative p-6 text-center">
            <div className="glass-card-gradient-hover absolute inset-0 z-0 bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(4,244,190,0.3),rgba(4,244,19,0))] opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(4,244,190,0.3),rgba(4,244,190,0))]"></div>
            <Heading3 className="relative z-10">Instagram</Heading3>

            <Paragraph className="relative z-10 text-center">
              En Instagram subimos fotos de recuerdos y mucho contenido motivacional 💪
            </Paragraph>

            <Link href="https://www.instagram.com/programaconnosotros/" target="_blank">
              <Button className="relative z-10 w-full md:w-auto">Abrir Instagram</Button>
            </Link>
          </div>

          <div className="group relative p-6 text-center">
            <div className="glass-card-gradient-hover absolute inset-0 z-0 bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(4,244,190,0.3),rgba(4,244,19,0))] opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(4,244,190,0.3),rgba(4,244,190,0))]"></div>
            <Heading3 className="relative z-10">YouTube</Heading3>

            <Paragraph className="relative z-10 text-center">
              Subimos videos de charlas, cursos y mucho más!
            </Paragraph>

            <Link href="https://www.youtube.com/@programaconnosotros2689/videos" target="_blank">
              <Button className="relative z-10 w-full md:w-auto">Abrir YouTube</Button>
            </Link>
          </div>
        </div>

        <div className="text-center">
          <div className="group relative">
            <div className="glass-card-gradient-hover absolute inset-0 z-0 bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(4,244,190,0.3),rgba(4,244,19,0))] opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(4,244,190,0.3),rgba(4,244,190,0))]"></div>
            <div className="p-6">
              <Heading3 className="relative z-10">LinkedIn</Heading3>

              <Paragraph className="relative z-10 text-center">
                En LinkedIn le damos visibilidad a todo lo que hacemos para que te sirva en tu
                carrera laboral como justificación de tu gran pasión por el software 💪
              </Paragraph>

              <Link
                href="https://www.linkedin.com/company/programaconnosotros"
                target="_blank"
                className="relative z-10"
              >
                <Button className="relative z-10 w-full md:w-auto">
                  Abrir LinkedIn <Linkedin className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        <MainSponsorCard />
      </motion.div>
    </motion.div>
  );
};

export default HomeClientSide;
