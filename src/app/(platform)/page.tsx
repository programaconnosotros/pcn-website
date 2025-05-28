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
import { cookies } from 'next/headers';
import Link from 'next/link';

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

            <Link href="/posts/historia-pcn">
              <ContentCard
                description="Te contamos por qué decidimos crear la comunidad y todos los pasos que hicimos para llegar a donde estamos hoy."
                image="/pre-lightning-talks.webp"
                title="Nuestra historia"
              />
            </Link>

            <ContentCard
              title="¿Sabías que podés sumarte al team de desarrollo de este website?"
              description="¡Comunicate con nosotros!"
              image="/starbucks.webp"
            />
          </div>

          <div className="flex flex-col gap-6">
            <DiscordCard />
            <MainSponsorCard />
            <PodcastCard />
          </div>
        </div>

        <div className="mt-6 flex">
          <InviteDevsToWork />
        </div>
      </section>
    </div>
  );
};

export default Home;
