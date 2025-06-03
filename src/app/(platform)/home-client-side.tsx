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
import { Images, LogIn, ScrollText, UserPlus } from 'lucide-react';
import { Heading1 } from '@/components/ui/heading-1';
import Link from 'next/link';
import { GlassCardHover } from '@/components/home/glass-card-hover';
import { motion } from 'motion/react';

// TODO: Add section to show our Instagram profile.
// TODO: Add section to show our YouTube channel.
// TODO: Add section to show our LinkedIn profile.

const HomeClientSide = ({ session }: { session: (Session & { user: User }) | null }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="mt-6 md:max-w-screen-xl md:px-20"
    >
      <GlassCardHover />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="mb-6 border"
      >
        <div className="flex w-full flex-col items-center justify-center gap-2 border-b p-6">
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
            <div className="flex flex-col items-center justify-center py-6">
              <img src="/logo.webp" alt="programaConNosotros" width={100} height={100} />

              <Heading1 variant="gradient" className="mb-6 mt-8 font-mono text-pcnGreen">
                programaConNosotros
              </Heading1>

              <p className="text-center text-lg">
                La comunidad que necesitas para llevar tu carrera
                <br /> en la industria del software al siguiente nivel! 🚀
              </p>

              <div className="mt-3 flex flex-row gap-2 py-6">
                <Button variant="outline">
                  Registrarme <UserPlus className="ml-2 h-4 w-4" />
                </Button>
                <Button>
                  Iniciar sesión <LogIn className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 border-b">
          <div className="group relative flex flex-col items-center justify-center border-b p-6">
            <div className="glass-card-gradient-hover absolute inset-0 z-0 bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(4,244,190,0.3),rgba(4,244,19,0))] opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(99,102,241,0.3),rgba(99,102,241,0))]"></div>
            <Heading3 variant="gradient" className="relative z-10">
              Contactos
            </Heading3>

            <Paragraph className="relative z-10 text-center">
              Podés conocer personas apasionadas por el software de todo el mundo, de todas las
              áreas y de todos los niveles.
            </Paragraph>
          </div>

          <div className="group relative flex flex-col items-center justify-center border-b border-l p-6">
            <div className="glass-card-gradient-hover absolute inset-0 z-0 bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(4,244,190,0.3),rgba(4,244,19,0))] opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(99,102,241,0.3),rgba(99,102,241,0))]"></div>
            <Heading3 variant="gradient" className="relative z-10">
              Mentores
            </Heading3>

            <Paragraph className="relative z-10 text-center">
              Podés encontrar mentores de primer nivel y también convertirte en uno y ayudar a
              muchas personas.
            </Paragraph>
          </div>

          <div className="group relative flex flex-col items-center justify-center border-b p-6">
            <div className="glass-card-gradient-hover absolute inset-0 z-0 bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(4,244,190,0.3),rgba(4,244,19,0))] opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(99,102,241,0.3),rgba(99,102,241,0))]"></div>
            <Heading3 variant="gradient" className="relative z-10">
              Oportunidades
            </Heading3>

            <Paragraph className="relative z-10 text-center">
              Podés encontrar oportunidades soñadas.
            </Paragraph>
          </div>

          <div className="group relative flex flex-col items-center justify-center border-b border-l p-6">
            <div className="glass-card-gradient-hover absolute inset-0 z-0 bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(4,244,190,0.3),rgba(4,244,19,0))] opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(99,102,241,0.3),rgba(99,102,241,0))]"></div>
            <Heading3 variant="gradient" className="relative z-10">
              Eventos
            </Heading3>

            <Paragraph className="relative z-10 text-center">
              Podés participar y organizar muchos eventos.
            </Paragraph>
          </div>

          <div className="group relative flex flex-col items-center justify-center p-6">
            <div className="glass-card-gradient-hover absolute inset-0 z-0 bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(4,244,190,0.3),rgba(4,244,19,0))] opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(99,102,241,0.3),rgba(99,102,241,0))]"></div>
            <Heading3 variant="gradient" className="relative z-10">
              Consejos
            </Heading3>

            <Paragraph className="relative z-10 text-center">
              Podés encontrar y compartir consejos con la comunidad.
            </Paragraph>
          </div>

          <div className="group relative flex flex-col items-center justify-center border-l p-6">
            <div className="glass-card-gradient-hover absolute inset-0 z-0 bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(4,244,190,0.3),rgba(4,244,19,0))] opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(99,102,241,0.3),rgba(99,102,241,0))]"></div>
            <Heading3 variant="gradient" className="relative z-10">
              Conocimiento
            </Heading3>

            <Paragraph className="relative z-10 text-center">
              Nos encanta dar charlas, cursos y compartir conocimiento con la comunidad.
            </Paragraph>
          </div>
        </div>

        <div className="border-b text-center">
          <div className="group relative">
            <div className="glass-card-gradient-hover absolute inset-0 z-0 bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(4,244,190,0.3),rgba(4,244,19,0))] p-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(99,102,241,0.3),rgba(99,102,241,0))]"></div>
            <div className="p-6">
              <Heading3 variant="gradient" className="relative z-10">
                Conocé la historia de nuestra comunidad
              </Heading3>

              <Paragraph className="relative z-10 text-center">
                Te contamos por qué decidimos crear la comunidad y todos los pasos que hicimos para
                llegar a donde estamos hoy.
              </Paragraph>

              <Link href="/posts/pcn-story" className="relative z-10">
                <Button variant="outline">
                  Leer la historia <ScrollText className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="border-b text-center">
          <div className="group relative">
            <div className="glass-card-gradient-hover absolute inset-0 z-0 bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(4,244,190,0.3),rgba(4,244,19,0))] opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(99,102,241,0.3),rgba(99,102,241,0))]"></div>
            <div className="p-6">
              <Heading3 variant="gradient" className="relative z-10">
                Fotos de la comunidad
              </Heading3>

              <Paragraph className="relative z-10 text-center">
                Visita nuestra galería de fotos para conocer más a la comunidad o revisar algunos
                recuerdos.
              </Paragraph>

              <Link href="/gallery" className="relative z-10">
                <Button variant="outline">
                  Ver galería <Images className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="flex flex-row border-b">
          <div className="group relative border-r p-6 text-center">
            <div className="glass-card-gradient-hover absolute inset-0 z-0 bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(4,244,190,0.3),rgba(4,244,19,0))] opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(99,102,241,0.3),rgba(99,102,241,0))]"></div>
            <Heading3 variant="gradient" className="relative z-10">
              Sumate al WhatsApp de PCN
            </Heading3>

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
            <Heading3 variant="gradient" className="relative z-10">
              Sumate al Discord de PCN
            </Heading3>

            <Paragraph className="relative z-10 text-center">
              Tenemos un grupo muy activo en el que tenemos conversaciones muy interesantes, además
              de compartir oportunidades, consejos y mucho más.
            </Paragraph>

            <Button variant="outline" className="relative z-10">
              Entrar al server en Discord
            </Button>
          </div>
        </div>

        <MainSponsorCard />

        <InviteDevsToWork />
        <Team />
      </motion.div>
    </motion.div>
  );
};

export default HomeClientSide;
