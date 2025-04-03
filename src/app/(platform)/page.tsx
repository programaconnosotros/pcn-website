import { AdvisesCard } from '@components/home/advises-card';
import { UpcomingEventsCard } from '@components/home/upcoming-events-card';
import { TalksCard } from '@components/home/talks-card';
import { UpcomingEventsSection } from '@components/home/upcoming-events-section';
import { MainSponsorCard } from '@components/home/main-sponsor-card';
import { MotivationalQuotes } from '@components/home/motivational-quotes';
import { Heading2 } from '@/components/ui/heading-2';
import { BackgroundOverlayCard } from '@/components/ui/background-overlay-card';
import { ContentCard } from '@/components/ui/content-card';
import { DiscordCard } from '@/components/home/discord-card';
import { PodcastCard } from '@/components/home/podcast-card';
import Link from 'next/link';
import { CoursesCard } from '@/components/home/courses-card';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { Session, User } from '@prisma/client';
import { InviteDevsToWork } from '@/components/home/invite-devs-to-work';

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

  return (
    <div className="mt-4 md:max-w-screen-xl md:px-20">
      <div className="mb-6 flex flex-col">
        <Heading2>
          {session?.user?.name ? `Hola ${session.user.name.split(' ')[0]}!` : 'Hola!'}
        </Heading2>

        <div className="hidden md:block">
          <MotivationalQuotes />
        </div>
      </div>

      <section className="mb-6 w-full">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <AdvisesCard />
          <CoursesCard />
          <UpcomingEventsCard />
          <TalksCard />
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-6">
            <UpcomingEventsSection />

            <Link href="/posts/pcn-story">
              <ContentCard
                author="Agustín Sánchez"
                description="Te cuento por qué decidimos crear la comunidad y todos los pasos que hicimos para llegar a donde estamos hoy."
                image="/pre-lightning-talks.jpeg"
                timeToRead="Lectura de 5 minutos"
                title="Nuestra historia"
              />
            </Link>

            <BackgroundOverlayCard
              title="¿Sabías que podés sumarte al team de desarrollo de este website?"
              description="¡Comunicate con nosotros!"
            />
          </div>

          <div className="flex flex-col gap-6">
            <DiscordCard />
            <MainSponsorCard />
            <PodcastCard />
          </div>
        </div>

        <div className='mt-6 flex'> 
          <InviteDevsToWork />
        </div>
      </section>
    </div>
  );
};

export default Home;
