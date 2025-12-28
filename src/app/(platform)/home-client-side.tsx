'use client';

import { InviteDevsToWork } from '@/components/home/invite-devs-to-work';
import { Heading2 } from '@/components/ui/heading-2';
import { SponsorsSection } from '@components/home/sponsors-section';
import { MotivationalQuotes } from '@components/home/motivational-quotes';
import { Team } from '@components/landing/team';
import { Session, User } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Heading3 } from '@/components/ui/heading-3';
import { Paragraph } from '@/components/ui/paragraph';
import {
  Book,
  Brain,
  Briefcase,
  Building2,
  Calendar,
  Globe,
  GraduationCap,
  Handshake,
  HelpCircle,
  Images,
  Laptop,
  Lightbulb,
  Linkedin,
  LogIn,
  MapPin,
  MessageSquare,
  MicVocal,
  Podcast,
  Monitor,
  MonitorPlay,
  Rocket,
  ScrollText,
  SquareMousePointer,
  Star,
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
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Quote } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type FeaturedTestimonial = {
  id: string;
  body: string;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
};

const HomeClientSide = ({
  session,
  featuredTestimonials,
}: {
  session: (Session & { user: User }) | null;
  featuredTestimonials: FeaturedTestimonial[];
}) => {
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
        className="-mx-1 mb-6 px-6 md:-mx-6 md:px-6"
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

            <Heading2 className="relative z-10 text-center text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] dark:drop-shadow-[0_0_10px_rgba(4,244,190,0.5)]">
              {session?.user?.name ? (
                <>
                  Hola{' '}
                  <span className="text-[#8B7FD9] drop-shadow-[0_0_8px_rgba(139,127,217,0.4)] dark:text-pcnGreen dark:drop-shadow-[0_0_8px_rgba(4,244,190,0.5)]">
                    {session.user.name.split(' ')[0]}
                  </span>
                  ! Gracias por ser parte de la comunidad.
                </>
              ) : (
                'Hola!'
              )}
            </Heading2>

            {/* <div className="hidden md:block">
              <MotivationalQuotes />
            </div> */}
          </div>
        ) : (
          // Componente usuario no logueado
          <div className="relative -mx-6 min-h-[400px] w-[calc(100%+3rem)] overflow-hidden bg-background pt-12 md:h-[500px] md:pt-0">
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
            <div className="absolute inset-0 z-0 bg-black/60" />

            <div className="absolute right-4 top-4 z-20">
              <ThemeToggle />
            </div>

            <div className="relative z-10 flex h-full w-full flex-col items-center justify-center px-4 py-6">
              <div className="flex flex-col items-center">
                <img src="/logo.webp" alt="programaConNosotros" className="w-[80px] md:w-[100px]" />
              </div>

              <Heading1 className="mb-4 mt-6 text-center font-mono text-3xl text-pcnGreen drop-shadow-[0_0_15px_rgba(4,244,190,0.8)] md:mb-6 md:mt-8 md:text-4xl">
                programaConNosotros
              </Heading1>

              <p className="px-4 text-center text-lg leading-relaxed text-white drop-shadow-[0_0_10px_rgba(4,244,190,0.6)] md:text-lg">
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

        <div className="z-10 mb-6 mt-4 flex justify-center md:-mt-12">
          <div className="group relative w-full max-w-4xl rounded-lg border-2 border-pcnPurple bg-[#e8e4f5] p-6 dark:border-pcnGreen/20 dark:bg-[linear-gradient(to_right,#012e24,#014a3a)]">
            <div
              className="dark:group-hover:opacity-8 absolute inset-0 opacity-10 transition-all duration-500 ease-out group-hover:scale-110 group-hover:opacity-15 dark:opacity-5"
              style={{
                backgroundImage: "url('/logo.webp')",
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                filter: 'grayscale(100%)',
                transform: 'scale(1)',
              }}
            />
            <div className="relative z-10 flex flex-col items-center">
              <p className="text-center text-black dark:text-white">
                Somos un grupo de personas apasionadas por el software que nos ayudamos entre sí
                para llevar nuestras carreras al siguiente nivel. El ambiente de nuestra comunidad
                es altamente inspirador y motivador para poder expandir nuestras capacidades, e
                intentamos atraer a más personas como nosotros, sin importar de dónde sean ni el
                nivel actual que tengan, siempre y cuando tengan pasión por el software y busquen
                superarse todos los días.
              </p>
            </div>
          </div>
        </div>

        {/* <Testimonials /> */}

        {/* TODO: Agregar sección de Lightning Talks */}

        <div className="flex items-center justify-center p-6">
          <Heading2 className="relative z-10 mb-6 text-center md:text-left">
            <span className="text-pcnPurple drop-shadow-[0_0_15px_rgba(80,56,189,0.4)] dark:text-pcnGreen dark:drop-shadow-[0_0_15px_rgba(4,244,190,0.8)]">
              Impulsá tu carrera
            </span>{' '}
            con estos{' '}
            <span className="relative inline-block">
              recursos
              <svg
                className="absolute -bottom-1 left-0 w-full"
                height="10"
                viewBox="0 0 100 10"
                preserveAspectRatio="none"
              >
                <path
                  d="M 0,7 L 6,2 L 11,5 L 16,1 L 22,4 L 28,2 L 34,6 L 40,1 L 46,5 L 52,2 L 58,6 L 64,1 L 70,5 L 76,2 L 82,6 L 88,1 L 94,5 L 100,4"
                  className="stroke-pcnPurple drop-shadow-[0_0_8px_rgba(80,56,189,0.6)] dark:stroke-pcnGreen dark:drop-shadow-[0_0_8px_rgba(4,244,190,0.8)]"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </Heading2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <div className="group relative flex flex-col items-center p-6 transition-all duration-300 hover:scale-[1.02]">
            <div className="glass-card-gradient-hover absolute inset-0 z-0 bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(80,56,189,0.15),rgba(80,56,189,0))] opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(4,244,190,0.3),rgba(4,244,190,0))]"></div>
            <div className="relative z-10 mb-4 flex justify-center">
              <Handshake
                className="h-10 w-10 text-pcnPurple drop-shadow-[0_0_10px_rgba(80,56,189,0.4)] transition-transform duration-300 group-hover:-rotate-12 dark:text-pcnGreen dark:drop-shadow-[0_0_10px_rgba(4,244,190,0.8)] md:h-12 md:w-12"
                strokeWidth={1.0}
              />
            </div>
            <Heading3 className="relative z-10">Consejos</Heading3>

            <Paragraph className="relative z-10 text-center text-muted-foreground">
              Podés encontrar y compartir consejos con la comunidad. Queremos armar uno de los
              mejores repositorios de consejos sobre ingeniería de software en internet.
            </Paragraph>

            <Link href="/consejos" className="relative z-10">
              <Button className="transition-all duration-300 group-hover:scale-110 group-hover:bg-pcnPurple group-hover:text-white group-hover:shadow-lg dark:group-hover:bg-pcnGreen dark:group-hover:text-black">
                Ver consejos
              </Button>
            </Link>
          </div>

          <div className="group relative flex flex-col items-center p-6 transition-all duration-300 hover:scale-[1.02]">
            <div className="glass-card-gradient-hover absolute inset-0 z-0 bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(80,56,189,0.15),rgba(80,56,189,0))] opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(4,244,190,0.3),rgba(4,244,190,0))]"></div>
            <div className="relative z-10 mb-4 flex justify-center">
              <MicVocal
                className="h-10 w-10 text-pcnPurple drop-shadow-[0_0_10px_rgba(80,56,189,0.4)] transition-transform duration-300 group-hover:-rotate-12 dark:text-pcnGreen dark:drop-shadow-[0_0_10px_rgba(4,244,190,0.8)] md:h-12 md:w-12"
                strokeWidth={1.0}
              />
            </div>
            <Heading3 className="relative z-10">Charlas</Heading3>

            <Paragraph className="relative z-10 text-center text-muted-foreground">
              Nos encanta dar charlas para compartir conocimiento. Tenemos una página para guardar
              el historial, las diapositivas y algunas charlas que quedaron grabadas.
            </Paragraph>

            <div className="flex flex-col gap-2 md:flex-row">
              <Link href="/charlas" className="relative z-10">
                <Button className="transition-all duration-300 group-hover:scale-110 group-hover:bg-pcnPurple group-hover:text-white group-hover:shadow-lg dark:group-hover:bg-pcnGreen dark:group-hover:text-black">
                  Ver charlas
                </Button>
              </Link>
            </div>
          </div>

          <div className="group relative flex flex-col items-center p-6 transition-all duration-300 hover:scale-[1.02]">
            <div className="glass-card-gradient-hover absolute inset-0 z-0 bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(80,56,189,0.15),rgba(80,56,189,0))] opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(4,244,190,0.3),rgba(4,244,190,0))]"></div>
            <div className="relative z-10 mb-4 flex justify-center">
              <Users
                className="h-10 w-10 text-pcnPurple drop-shadow-[0_0_10px_rgba(80,56,189,0.4)] transition-transform duration-300 group-hover:-rotate-12 dark:text-pcnGreen dark:drop-shadow-[0_0_10px_rgba(4,244,190,0.8)] md:h-12 md:w-12"
                strokeWidth={1.0}
              />
            </div>
            <Heading3 className="relative z-10">Contactos</Heading3>

            <Paragraph className="relative z-10 text-center text-muted-foreground">
              Podés conocer personas apasionadas por el software de todo el mundo, de todas las
              áreas y de todos los niveles.
            </Paragraph>

            <Link href="/consejos" className="relative z-10">
              <Button className="transition-all duration-300 group-hover:scale-110 group-hover:bg-pcnPurple group-hover:text-white group-hover:shadow-lg dark:group-hover:bg-pcnGreen dark:group-hover:text-black">
                Conocer a la comunidad
              </Button>
            </Link>
          </div>

          <div className="group relative flex flex-col items-center p-6 transition-all duration-300 hover:scale-[1.02]">
            <div className="glass-card-gradient-hover absolute inset-0 z-0 bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(80,56,189,0.15),rgba(80,56,189,0))] opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(4,244,190,0.3),rgba(4,244,190,0))]"></div>
            <div className="relative z-10 mb-4 flex justify-center">
              <Brain
                className="h-10 w-10 text-pcnPurple drop-shadow-[0_0_10px_rgba(80,56,189,0.4)] transition-transform duration-300 group-hover:-rotate-12 dark:text-pcnGreen dark:drop-shadow-[0_0_10px_rgba(4,244,190,0.8)] md:h-12 md:w-12"
                strokeWidth={1.0}
              />
            </div>
            <Heading3 className="relative z-10">Mentores</Heading3>

            <Paragraph className="relative z-10 text-center text-muted-foreground">
              Podés encontrar mentores de primer nivel y también convertirte en uno para ayudar a
              muchas personas en su crecimiento profesional.
            </Paragraph>

            <Link href="/mentores" className="relative z-10">
              <Button className="transition-all duration-300 group-hover:scale-110 group-hover:bg-pcnPurple group-hover:text-white group-hover:shadow-lg dark:group-hover:bg-pcnGreen dark:group-hover:text-black">
                Conocer mentores
              </Button>
            </Link>
          </div>

          <div className="group relative flex flex-col items-center p-6 transition-all duration-300 hover:scale-[1.02]">
            <div className="glass-card-gradient-hover absolute inset-0 z-0 bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(80,56,189,0.15),rgba(80,56,189,0))] opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(4,244,190,0.3),rgba(4,244,190,0))]"></div>
            <div className="relative z-10 mb-4 flex justify-center">
              <Globe
                className="h-10 w-10 text-pcnPurple drop-shadow-[0_0_10px_rgba(80,56,189,0.4)] transition-transform duration-300 group-hover:-rotate-12 dark:text-pcnGreen dark:drop-shadow-[0_0_10px_rgba(4,244,190,0.8)] md:h-12 md:w-12"
                strokeWidth={1.0}
              />
            </div>
            <Heading3 className="relative z-10">Oportunidades</Heading3>

            <Paragraph className="relative z-10 text-center text-muted-foreground">
              Muy seguido estamos compartiendo oportunidades soñadas para crecer en la industria del
              software y avanzar en tu carrera profesional.
            </Paragraph>

            <div className="flex flex-col gap-2">
              <Link href="https://chat.whatsapp.com/IFwKhHXoMwM6ysKcbfHiEh" target="_blank">
                <Button className="relative z-10 w-full transition-all duration-300 group-hover:scale-110 group-hover:bg-pcnPurple group-hover:text-white group-hover:shadow-lg dark:group-hover:bg-pcnGreen dark:group-hover:text-black">
                  PCN en WhatsApp
                </Button>
              </Link>

              <Link href="https://discord.gg/dTQexKw56S" target="_blank">
                <Button className="relative z-10 w-full transition-all duration-300 group-hover:scale-110 group-hover:bg-pcnPurple group-hover:text-white group-hover:shadow-lg dark:group-hover:bg-pcnGreen dark:group-hover:text-black">
                  PCN en Discord
                </Button>
              </Link>
            </div>
          </div>

          <div className="group relative flex flex-col items-center p-6 transition-all duration-300 hover:scale-[1.02]">
            <div className="glass-card-gradient-hover absolute inset-0 z-0 bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(80,56,189,0.15),rgba(80,56,189,0))] opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(4,244,190,0.3),rgba(4,244,190,0))]"></div>
            <div className="relative z-10 mb-4 flex justify-center">
              <Calendar
                className="h-10 w-10 text-pcnPurple drop-shadow-[0_0_10px_rgba(80,56,189,0.4)] transition-transform duration-300 group-hover:-rotate-12 dark:text-pcnGreen dark:drop-shadow-[0_0_10px_rgba(4,244,190,0.8)] md:h-12 md:w-12"
                strokeWidth={1.0}
              />
            </div>
            <Heading3 className="relative z-10">Eventos</Heading3>

            <Paragraph className="relative z-10 text-center text-muted-foreground">
              Podés participar y organizar muchos eventos técnicos en los que podes aprender mucho,
              compartir tu conocimiento y conocer personas increíbles.
            </Paragraph>

            <Link href="/eventos" className="relative z-10">
              <Button className="transition-all duration-300 group-hover:scale-110 group-hover:bg-pcnPurple group-hover:text-white group-hover:shadow-lg dark:group-hover:bg-pcnGreen dark:group-hover:text-black">
                Ver eventos
              </Button>
            </Link>
          </div>

          <div className="group relative flex flex-col items-center p-6 transition-all duration-300 hover:scale-[1.02]">
            <div className="glass-card-gradient-hover absolute inset-0 z-0 bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(80,56,189,0.15),rgba(80,56,189,0))] opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(4,244,190,0.3),rgba(4,244,190,0))]"></div>
            <div className="relative z-10 mb-4 flex justify-center">
              <Book
                className="h-10 w-10 text-pcnPurple drop-shadow-[0_0_10px_rgba(80,56,189,0.4)] transition-transform duration-300 group-hover:-rotate-12 dark:text-pcnGreen dark:drop-shadow-[0_0_10px_rgba(4,244,190,0.8)] md:h-12 md:w-12"
                strokeWidth={1.0}
              />
            </div>
            <Heading3 className="relative z-10">Lectura</Heading3>

            <Paragraph className="relative z-10 text-center text-muted-foreground">
              Club de lectura PCN donde compartimos y discutimos libros sobre programación,
              tecnología y desarrollo profesional. Encontrá libros recomendados y sumate al grupo.
            </Paragraph>

            <Link href="/lectura" className="relative z-10">
              <Button className="transition-all duration-300 group-hover:scale-110 group-hover:bg-pcnPurple group-hover:text-white group-hover:shadow-lg dark:group-hover:bg-pcnGreen dark:group-hover:text-black">
                Ver libros
              </Button>
            </Link>
          </div>

          <div className="group relative flex flex-col items-center p-6 transition-all duration-300 hover:scale-[1.02]">
            <div className="glass-card-gradient-hover absolute inset-0 z-0 bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(80,56,189,0.15),rgba(80,56,189,0))] opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(4,244,190,0.3),rgba(4,244,190,0))]"></div>
            <div className="relative z-10 mb-4 flex justify-center">
              <Podcast
                className="h-10 w-10 text-pcnPurple drop-shadow-[0_0_10px_rgba(80,56,189,0.4)] transition-transform duration-300 group-hover:-rotate-12 dark:text-pcnGreen dark:drop-shadow-[0_0_10px_rgba(4,244,190,0.8)] md:h-12 md:w-12"
                strokeWidth={1.0}
              />
            </div>
            <Heading3 className="relative z-10">Podcast</Heading3>

            <Paragraph className="relative z-10 text-center text-muted-foreground">
              Escuchá nuestros podcasts donde conversamos sobre tecnología, desarrollo de software,
              carreras profesionales y mucho más con miembros de la comunidad.
            </Paragraph>

            <Link href="/podcast" className="relative z-10">
              <Button className="transition-all duration-300 group-hover:scale-110 group-hover:bg-pcnPurple group-hover:text-white group-hover:shadow-lg dark:group-hover:bg-pcnGreen dark:group-hover:text-black">
                Ver podcast
              </Button>
            </Link>
          </div>

          <div className="group relative flex flex-col items-center p-6 transition-all duration-300 hover:scale-[1.02]">
            <div className="glass-card-gradient-hover absolute inset-0 z-0 bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(80,56,189,0.15),rgba(80,56,189,0))] opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(4,244,190,0.3),rgba(4,244,190,0))]"></div>
            <div className="relative z-10 mb-4 flex justify-center">
              <Laptop
                className="h-10 w-10 text-pcnPurple drop-shadow-[0_0_10px_rgba(80,56,189,0.4)] transition-transform duration-300 group-hover:-rotate-12 dark:text-pcnGreen dark:drop-shadow-[0_0_10px_rgba(4,244,190,0.8)] md:h-12 md:w-12"
                strokeWidth={1.0}
              />
            </div>
            <Heading3 className="relative z-10">Cursos</Heading3>

            <Paragraph className="relative z-10 text-center text-muted-foreground">
              Aprendé nuevas habilidades con nuestros cursos sobre herramientas y tecnologías
              esenciales para desarrolladores.
            </Paragraph>

            <Link href="/cursos" className="relative z-10">
              <Button className="transition-all duration-300 group-hover:scale-110 group-hover:bg-pcnPurple group-hover:text-white group-hover:shadow-lg dark:group-hover:bg-pcnGreen dark:group-hover:text-black">
                Ver cursos
              </Button>
            </Link>
          </div>

          <div className="group relative flex flex-col items-center p-6 transition-all duration-300 hover:scale-[1.02]">
            <div className="glass-card-gradient-hover absolute inset-0 z-0 bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(80,56,189,0.15),rgba(80,56,189,0))] opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(4,244,190,0.3),rgba(4,244,190,0))]"></div>
            <div className="relative z-10 mb-4 flex justify-center">
              <SquareMousePointer
                className="h-10 w-10 text-pcnPurple drop-shadow-[0_0_10px_rgba(80,56,189,0.4)] transition-transform duration-300 group-hover:-rotate-12 dark:text-pcnGreen dark:drop-shadow-[0_0_10px_rgba(4,244,190,0.8)] md:h-12 md:w-12"
                strokeWidth={1.0}
              />
            </div>
            <Heading3 className="relative z-10 text-center">Software útil</Heading3>

            <Paragraph className="relative z-10 text-center text-muted-foreground">
              Descubrí herramientas y software recomendados por la comunidad para mejorar tu
              productividad y flujo de trabajo como desarrollador.
            </Paragraph>

            <Link href="/software-util" className="relative z-10">
              <Button className="transition-all duration-300 group-hover:scale-110 group-hover:bg-pcnPurple group-hover:text-white group-hover:shadow-lg dark:group-hover:bg-pcnGreen dark:group-hover:text-black">
                Ver software
              </Button>
            </Link>
          </div>

          <div className="group relative flex flex-col items-center p-6 transition-all duration-300 hover:scale-[1.02]">
            <div className="glass-card-gradient-hover absolute inset-0 z-0 bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(80,56,189,0.15),rgba(80,56,189,0))] opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(4,244,190,0.3),rgba(4,244,190,0))]"></div>
            <div className="relative z-10 mb-4 flex justify-center">
              <MessageSquare
                className="h-10 w-10 text-pcnPurple drop-shadow-[0_0_10px_rgba(80,56,189,0.4)] transition-transform duration-300 group-hover:-rotate-12 dark:text-pcnGreen dark:drop-shadow-[0_0_10px_rgba(4,244,190,0.8)] md:h-12 md:w-12"
                strokeWidth={1.0}
              />
            </div>
            <Heading3 className="relative z-10">Foro</Heading3>

            <Paragraph className="relative z-10 text-center text-muted-foreground">
              Participá en discusiones, hacé preguntas y compartí conocimiento con otros miembros de
              la comunidad en nuestro foro.
            </Paragraph>

            <div className="relative z-10">
              <p className="text-center text-muted-foreground">Próximamente</p>
            </div>
          </div>

          <div className="group relative flex flex-col items-center p-6 transition-all duration-300 hover:scale-[1.02]">
            <div className="glass-card-gradient-hover absolute inset-0 z-0 bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(80,56,189,0.15),rgba(80,56,189,0))] opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(4,244,190,0.3),rgba(4,244,190,0))]"></div>
            <div className="relative z-10 mb-4 flex justify-center">
              <Monitor
                className="h-10 w-10 text-pcnPurple drop-shadow-[0_0_10px_rgba(80,56,189,0.4)] transition-transform duration-300 group-hover:-rotate-12 dark:text-pcnGreen dark:drop-shadow-[0_0_10px_rgba(4,244,190,0.8)] md:h-12 md:w-12"
                strokeWidth={1.0}
              />
            </div>
            <Heading3 className="relative z-10">Setups</Heading3>

            <Paragraph className="relative z-10 text-center text-muted-foreground">
              Inspirate con los setups de trabajo de otros miembros de la comunidad. Compartí fotos
              de tu espacio de trabajo y descubrí nuevas ideas.
            </Paragraph>

            <div className="relative z-10">
              <p className="text-center text-muted-foreground">Próximamente</p>
            </div>
          </div>
        </div>

        <div className="-mx-6 w-[calc(100%+3rem)] text-center">
          <div className="group relative">
            <div className="glass-card-gradient-hover absolute inset-0 z-0 bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(80,56,189,0.15),rgba(80,56,189,0))] opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(4,244,190,0.3),rgba(4,244,190,0))]"></div>

            <div className="relative flex min-h-[400px] flex-col items-center justify-center bg-[url('/IMG_8959.webp')] bg-cover bg-center bg-no-repeat p-6">
              <div className="absolute inset-0 bg-black/70"></div>
              <Heading2 className="relative z-10 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] dark:drop-shadow-[0_0_10px_rgba(4,244,190,0.5)]">
                Conocé la historia de PCN
              </Heading2>

              <Paragraph className="relative z-10 text-center text-white">
                Te contamos por qué decidimos crear la comunidad y todos los pasos que hicimos para
                llegar a donde estamos hoy.
              </Paragraph>

              <Link href="/historia" className="relative z-10">
                <Button
                  variant="outline"
                  className="transition-all duration-300 group-hover:scale-110 group-hover:border-pcnPurple group-hover:bg-pcnPurple group-hover:text-white group-hover:shadow-lg dark:group-hover:border-pcnGreen dark:group-hover:bg-pcnGreen dark:group-hover:text-black dark:group-hover:shadow-[0_0_20px_rgba(4,244,190,0.7)]"
                >
                  Leer historia <ScrollText className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="-mx-6 w-[calc(100%+3rem)] text-center">
          <div className="group relative">
            <div className="glass-card-gradient-hover absolute inset-0 z-0 bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(80,56,189,0.15),rgba(80,56,189,0))] opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(4,244,190,0.3),rgba(4,244,190,0))]"></div>

            <div className="relative flex min-h-[400px] flex-col items-center justify-center bg-[url('/photos/talk-class.webp')] bg-cover bg-center bg-no-repeat p-6">
              <div className="absolute inset-0 bg-black/70"></div>
              <Heading2 className="relative z-10 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] dark:drop-shadow-[0_0_10px_rgba(4,244,190,0.5)]">
                Visita la galería de PCN
              </Heading2>

              <Paragraph className="relative z-10 text-center text-white">
                Conocé la comunidad o revisa algunos recuerdos en nuestra galería.
              </Paragraph>

              <Link href="/galeria" className="relative z-10">
                <Button
                  variant="outline"
                  className="transition-all duration-300 group-hover:scale-110 group-hover:border-pcnPurple group-hover:bg-pcnPurple group-hover:text-white group-hover:shadow-lg dark:group-hover:border-pcnGreen dark:group-hover:bg-pcnGreen dark:group-hover:text-black"
                >
                  Ver galería <Images className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <SponsorsSection />

        {featuredTestimonials.length > 0 && (
          <>
            <div className="flex items-center justify-center p-6">
              <Heading2 className="relative z-10 text-center">
                Lo que dicen nuestros miembros
              </Heading2>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              {featuredTestimonials.map((testimonial) => (
                <Card
                  key={testimonial.id}
                  className="flex flex-col border-2 border-transparent bg-gradient-to-br from-white to-gray-50 transition-all duration-300 hover:scale-[1.02] hover:border-pcnPurple hover:shadow-xl dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-800 dark:hover:border-pcnGreen dark:hover:shadow-pcnGreen/20"
                >
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Quote className="h-5 w-5 text-pcnPurple dark:text-pcnGreen" />
                      <h3 className="text-lg font-semibold">{testimonial.user.name}</h3>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{testimonial.body}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mb-6 flex justify-center">
              <Link href="/testimonios">
                <Button variant="outline">Ver todos los testimonios</Button>
              </Link>
            </div>
          </>
        )}

        <div className="flex items-center justify-center gap-3 p-6">
          <Heading2 className="relative z-10 mb-0 text-center text-3xl text-pcnPurple drop-shadow-[0_0_15px_rgba(80,56,189,0.4)] dark:text-pcnGreen dark:drop-shadow-[0_0_15px_rgba(4,244,190,0.8)] md:text-4xl">
            Redes
          </Heading2>
          <Globe className="-mt-2 h-8 w-8 text-pcnPurple drop-shadow-[0_0_10px_rgba(80,56,189,0.4)] dark:text-pcnGreen dark:drop-shadow-[0_0_10px_rgba(4,244,190,0.8)] md:h-10 md:w-10" />
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="https://chat.whatsapp.com/IFwKhHXoMwM6ysKcbfHiEh"
            target="_blank"
            className="group relative flex flex-[1_1_100%] items-center gap-4 rounded-lg border border-neutral-200 bg-transparent p-4 transition-all duration-300 hover:scale-[1.02] hover:border-[#25D366] hover:shadow-lg dark:border-neutral-800 dark:bg-transparent dark:hover:border-[#25D366] sm:flex-[1_1_calc(50%-0.375rem)] lg:flex-[1_1_calc(33.333%-0.5rem)]"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#25D366]/10 dark:bg-[#25D366]/20">
              <img src="/social-networks/whatsapp.svg" alt="WhatsApp" className="h-8 w-8" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-neutral-900 dark:text-white">WhatsApp</h3>
              <p className="text-sm text-muted-foreground">
                Grupo activo con conversaciones y oportunidades
              </p>
            </div>
          </Link>

          <Link
            href="https://discord.gg/dTQexKw56S"
            target="_blank"
            className="group relative flex flex-[1_1_100%] items-center gap-4 rounded-lg border border-neutral-200 bg-transparent p-4 transition-all duration-300 hover:scale-[1.02] hover:border-[#5865F2] hover:shadow-lg dark:border-neutral-800 dark:bg-transparent dark:hover:border-[#5865F2] sm:flex-[1_1_calc(50%-0.375rem)] lg:flex-[1_1_calc(33.333%-0.5rem)]"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#5865F2]/10 dark:bg-[#5865F2]/20">
              <img src="/social-networks/discord.svg" alt="Discord" className="h-8 w-8" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-neutral-900 dark:text-white">Discord</h3>
              <p className="text-sm text-muted-foreground">
                Canales de voz, texto y eventos virtuales
              </p>
            </div>
          </Link>

          <Link
            href="https://www.instagram.com/programaconnosotros/"
            target="_blank"
            className="group relative flex flex-[1_1_100%] items-center gap-4 rounded-lg border border-neutral-200 bg-transparent p-4 transition-all duration-300 hover:scale-[1.02] hover:border-[#E4405F] hover:shadow-lg dark:border-neutral-800 dark:bg-transparent dark:hover:border-[#E4405F] sm:flex-[1_1_calc(50%-0.375rem)] lg:flex-[1_1_calc(33.333%-0.5rem)]"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#E4405F]/10 dark:bg-[#E4405F]/20">
              <img src="/social-networks/instagram.svg" alt="Instagram" className="h-8 w-8" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-neutral-900 dark:text-white">Instagram</h3>
              <p className="text-sm text-muted-foreground">
                Fotos de recuerdos y contenido motivacional
              </p>
            </div>
          </Link>

          <Link
            href="https://www.youtube.com/@programaconnosotros2689/videos"
            target="_blank"
            className="group relative flex flex-[1_1_100%] items-center gap-4 rounded-lg border border-neutral-200 bg-transparent p-4 transition-all duration-300 hover:scale-[1.02] hover:border-[#FF0000] hover:shadow-lg dark:border-neutral-800 dark:bg-transparent dark:hover:border-[#FF0000] sm:flex-[1_1_calc(50%-0.375rem)] lg:flex-[1_1_calc(33.333%-0.5rem)]"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#FF0000]/10 dark:bg-[#FF0000]/20">
              <img src="/social-networks/youtube.svg" alt="YouTube" className="h-8 w-8" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-neutral-900 dark:text-white">YouTube</h3>
              <p className="text-sm text-muted-foreground">
                Videos de charlas, cursos y más contenido
              </p>
            </div>
          </Link>

          <Link
            href="https://www.linkedin.com/company/programaconnosotros"
            target="_blank"
            className="group relative flex flex-[1_1_100%] items-center gap-4 rounded-lg border border-neutral-200 bg-transparent p-4 transition-all duration-300 hover:scale-[1.02] hover:border-[#0077B5] hover:shadow-lg dark:border-neutral-800 dark:bg-transparent dark:hover:border-[#0077B5] sm:flex-[1_1_calc(50%-0.375rem)] lg:flex-[1_1_calc(33.333%-0.5rem)]"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#0077B5]/10 dark:bg-[#0077B5]/20">
              <img src="/social-networks/linkedin.svg" alt="LinkedIn" className="h-8 w-8" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-neutral-900 dark:text-white">LinkedIn</h3>
              <p className="text-sm text-muted-foreground">
                Visibilidad profesional y crecimiento de carrera
              </p>
            </div>
          </Link>
        </div>

        <div className="-mx-6 w-[calc(100%+3rem)] py-10">
          <div className="mx-6 rounded-xl border-2 border-pcnPurple/20 bg-gradient-to-br from-pcnPurple/10 to-pcnPurple/5 p-8 transition-all duration-300 hover:scale-[1.02] hover:border-pcnPurple hover:shadow-xl dark:border-pcnGreen/20 dark:from-pcnGreen/10 dark:to-pcnGreen/5 dark:hover:border-pcnGreen dark:hover:shadow-pcnGreen/20 md:p-12">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="mb-2 flex items-center justify-center gap-4">
                <GraduationCap
                  className="h-8 w-8 text-pcnPurple dark:text-pcnGreen"
                  strokeWidth={1.5}
                />
                <MapPin className="h-8 w-8 text-pcnPurple dark:text-pcnGreen" strokeWidth={1.5} />
                <Rocket className="h-8 w-8 text-pcnPurple dark:text-pcnGreen" strokeWidth={1.5} />
              </div>
              <Heading2 className="mb-0 pb-0 text-pcnPurple dark:text-pcnGreen">
                ¿Querés ser referente de PCN en tu ciudad o universidad?
              </Heading2>
              <Paragraph className="-mt-3 max-w-3xl text-base md:text-lg">
                Si compartís los valores de PCN y en tu universidad o ciudad aún no hay muchos
                miembros, podemos armar un plan para que la comunidad crezca ahí y que seas un
                referente.
              </Paragraph>
              <Link href="https://wa.me/5493815777562" target="_blank">
                <Button className="flex items-center gap-2 bg-pcnPurple text-white hover:bg-pcnPurple/90 dark:bg-pcnGreen dark:text-black dark:hover:bg-pcnGreen/90">
                  <MessageSquare className="h-4 w-4" />
                  Contactanos
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <InviteDevsToWork />
        <Team />

        <div className="flex items-center justify-center p-6">
          <Heading2 className="relative z-10 text-center">
            Todos pueden crear y aportar en la comunidad
          </Heading2>
        </div>

        <div className="-mx-6 w-[calc(100%+3rem)] py-10">
          <div className="mx-6 rounded-xl border-2 border-pcnPurple/20 bg-gradient-to-br from-pcnPurple/10 to-pcnPurple/5 p-8 transition-all duration-300 hover:scale-[1.02] hover:border-pcnPurple hover:shadow-xl dark:border-pcnGreen/20 dark:from-pcnGreen/10 dark:to-pcnGreen/5 dark:hover:border-pcnGreen dark:hover:shadow-pcnGreen/20 md:p-12">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="mb-2 flex items-center justify-center gap-4">
                <Lightbulb
                  className="h-8 w-8 text-pcnPurple dark:text-pcnGreen"
                  strokeWidth={1.5}
                />
                <Rocket className="h-8 w-8 text-pcnPurple dark:text-pcnGreen" strokeWidth={1.5} />
                <Users className="h-8 w-8 text-pcnPurple dark:text-pcnGreen" strokeWidth={1.5} />
              </div>
              <Heading2 className="mb-0 pb-0 text-pcnPurple dark:text-pcnGreen">
                ¿Querés organizar algo o proponer una iniciativa?
              </Heading2>
              <Paragraph className="-mt-3 max-w-3xl text-base md:text-lg">
                Si tenés una idea que sea buena para la comunidad, querés organizar algo o proponer
                cualquier iniciativa, contactanos y vemos la forma de llevarlo a cabo.
              </Paragraph>
              <Link href="https://wa.me/5493815777562" target="_blank">
                <Button className="flex items-center gap-2 bg-pcnPurple text-white hover:bg-pcnPurple/90 dark:bg-pcnGreen dark:text-black dark:hover:bg-pcnGreen/90">
                  <MessageSquare className="h-4 w-4" />
                  Contactanos
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
