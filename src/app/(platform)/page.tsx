import { CoursesCard } from '@/components/home/courses-card';
import { DiscordCard } from '@/components/home/discord-card';
import { InviteDevsToWork } from '@/components/home/invite-devs-to-work';
import { PodcastCard } from '@/components/home/podcast-card';
import { ContentCard } from '@/components/ui/content-card';
import { Heading2 } from '@/components/ui/heading-2';
import prisma from '@/lib/prisma';
import { AdvisesCard } from '@components/home/advises-card';
import { MainSponsorCard } from '@components/home/main-sponsor-card';
import { MotivationalQuotes } from '@components/home/motivational-quotes';
import { TalksCard } from '@components/home/talks-card';
import { UpcomingEventsCard } from '@components/home/upcoming-events-card';
import { UpcomingEventsSection } from '@components/home/upcoming-events-section';
import { Session, User } from '@prisma/client';
import { InviteDevsToWork } from '@/components/home/invite-devs-to-work';
import { BestAdvises } from '@/components/home/best-advises';
import { ImageCarousel } from '@/components/ui/image-carousel';
import fs from 'fs';
import path from 'path';
import { Button } from '@/components/ui/button';
import { Heading3 } from '@/components/ui/heading-3';
import { Paragraph } from '@/components/ui/paragraph';
import { BookOpen, Images, LogIn, ScrollText, UserPlus } from 'lucide-react';
import { GlowingText } from '@/components/ui/glowing-text';
import { Heading1 } from '@/components/ui/heading-1';

// TODO: Add section to show our Instagram profile.
// TODO: Add section to show our YouTube channel.
// TODO: Add section to show our LinkedIn profile.

const Home = async () => {
  const sessionId = cookies().get('sessionId')?.value;

  let session: (Session & { user: User }) | null = null;

  if (sessionId) {
    session = await prisma.session.findUnique({
      where: {
        id: sessionId,
      },
      include: {
        user: true,
      },
    });
  }

  // Leer las imágenes de la carpeta gallery-photos
  const galleryPath = path.join(process.cwd(), 'public', 'gallery-photos');
  const files = fs.readdirSync(galleryPath);
  const images = files
    .filter((file) => /\.(webp|jpg|jpeg|png|gif)$/i.test(file))
    .map((file) => `/gallery-photos/${file}`);

  return (
    <div className="mt-4 md:max-w-screen-xl md:px-20">
      <div className="mb-6 border">
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
            <>
              <Heading1 variant="gradient" className="mb-4 font-mono text-pcnGreen">
                programaConNosotros
              </Heading1>

              <p className="text-center text-lg text-white/50">
                La comunidad que necesitas para llevar tu carrera
                <br /> en la industria del software al siguiente nivel!
              </p>

              <div className="mt-3 flex flex-row gap-2">
                <Button variant="outline">
                  Registrarme <UserPlus className="ml-2 h-4 w-4" />
                </Button>
                <Button>
                  Iniciar sesión <LogIn className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </div>

        <div className="grid grid-cols-2 border-b">
          <div className="flex flex-col items-center justify-center border-b p-6">
            <Heading3 variant="gradient">Contactos</Heading3>

            <Paragraph className="text-center">
              Podés conocer personas apasionadas por el software de todo el mundo, de todas las
              áreas y de todos los niveles.
            </Paragraph>
          </div>

          <div className="flex flex-col items-center justify-center border-b border-l p-6">
            <Heading3 variant="gradient">Mentores</Heading3>

            <Paragraph className="text-center">
              Podés encontrar mentores de primer nivel y también convertirte en uno y ayudar a
              muchas personas.
            </Paragraph>
          </div>

          <div className="flex flex-col items-center justify-center border-b p-6">
            <Heading3 variant="gradient">Oportunidades</Heading3>

            <Paragraph className="text-center">Podés encontrar oportunidades soñadas.</Paragraph>
          </div>

          <div className="flex flex-col items-center justify-center border-b border-l p-6">
            <Heading3 variant="gradient">Eventos</Heading3>

            <Paragraph className="text-center">
              Podés participar y organizar muchos eventos.
            </Paragraph>
          </div>

          <div className="flex flex-col items-center justify-center p-6">
            <Heading3 variant="gradient">Consejos</Heading3>

            <Paragraph className="text-center">
              Podés encontrar y compartir consejos con la comunidad.
            </Paragraph>
          </div>

          <div className="flex flex-col items-center justify-center border-l p-6">
            <Heading3 variant="gradient">Conocimiento</Heading3>

            <Paragraph className="text-center">
              Nos encanta dar charlas, cursos y compartir conocimiento con la comunidad.
            </Paragraph>
          </div>
        </div>

        <div className="border-b p-6 text-center">
          <Heading3 variant="gradient">Conocé la historia de nuestra comunidad</Heading3>

          <Paragraph className="text-center">
            Te contamos por qué decidimos crear la comunidad y todos los pasos que hicimos para
            llegar a donde estamos hoy.
          </Paragraph>

          <Link href="/posts/pcn-story">
            <Button variant="outline">
              Leer la historia <ScrollText className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="border-b p-6 text-center">
          <Heading3 variant="gradient">Fotos de la comunidad</Heading3>

          <Paragraph className="text-center">
            Visita nuestra galería de fotos para conocer más a la comunidad o revisar algunos
            recuerdos.
          </Paragraph>

          <Link href="/gallery">
            <Button variant="outline">
              Ver galería <Images className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="flex flex-row border-b">
          <div className="border-r p-6 text-center">
            <Heading3 variant="gradient">Sumate al WhatsApp de PCN</Heading3>

            <Paragraph className="text-center">
              Tenemos un grupo muy activo en el que tenemos conversaciones muy interesantes, además
              de compartir oportunidades, consejos y mucho más.
            </Paragraph>

            <Button variant="outline">Entrar a la comunidad en WhatsApp</Button>
          </div>

          <div className="p-6 text-center">
            <Heading3 variant="gradient">Sumate al Discord de PCN</Heading3>

            <Paragraph className="text-center">
              Tenemos un grupo muy activo en el que tenemos conversaciones muy interesantes, además
              de compartir oportunidades, consejos y mucho más.
            </Paragraph>

            <Button variant="outline">Entrar al server en Discord</Button>
          </div>
        </div>

        <MainSponsorCard />

        <InviteDevsToWork />
      </div>
    </div>
  );
};

export default Home;
