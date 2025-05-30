import { AdvisesCard } from '@components/home/advises-card';
import { UpcomingEventsCard } from '@components/home/upcoming-events-card';
import { TalksCard } from '@components/home/talks-card';
import { UpcomingEventsSection } from '@components/home/upcoming-events-section';
import { MainSponsorCard } from '@components/home/main-sponsor-card';
import { MotivationalQuotes } from '@components/home/motivational-quotes';
import { Heading2 } from '@/components/ui/heading-2';
import { ContentCard } from '@/components/ui/content-card';
import { DiscordCard } from '@/components/home/discord-card';
import { PodcastCard } from '@/components/home/podcast-card';
import Link from 'next/link';
import { CoursesCard } from '@/components/home/courses-card';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { Session, User } from '@prisma/client';
import { InviteDevsToWork } from '@/components/home/invite-devs-to-work';
import { BestAdvises } from '@/components/home/best-advises';
import { ImageCarousel } from '@/components/ui/image-carousel';

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
        <div className="flex w-full flex-row gap-6">
          <div className="flex w-1/5 flex-col gap-6">
            <AdvisesCard />
            <CoursesCard />
            <UpcomingEventsCard />
            <TalksCard />
          </div>

          <div className="flex w-2/5 flex-col gap-6 rounded-lg border border-white/10 p-6">
            <BestAdvises />
          </div>

          <div className="flex w-2/5 flex-col gap-6">
            <ImageCarousel
              images={[
                '/gallery-photos/agus-chelo-talk.webp',
                '/gallery-photos/agus-init.webp',
                '/gallery-photos/agus-pc.webp',
              ]}
            />
          </div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-6">
            <UpcomingEventsSection />
            <Link href="/posts/pcn-story">
              <ContentCard
                description="Te contamos por qué decidimos crear la comunidad y todos los pasos que hicimos para llegar a donde estamos hoy."
                image="/pre-lightning-talks.webp"
                title="Nuestra historia"
              />
            </Link>
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
