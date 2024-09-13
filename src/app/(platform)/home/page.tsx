import { AdvisesCard } from '@components/home/advises-card';
import { ActiveMembersCard } from '@components/home/active-members-card';
import { UpcomingEventsCard } from '@components/home/upcoming-events-card';
import { LightningTalksCard } from '@components/home/lightning-talks-card';
import { UpcomingEventsSection } from '@components/home/upcoming-events-section';
import { MainSponsorCard } from '@components/home/main-sponsor-card';
import { MotivationalQuotes } from '@components/home/motivational-quotes';
import { Heading2 } from '@/components/ui/heading-2';
import { auth } from '@/auth';
import { BackgroundOverlayCard } from '@/components/ui/background-overlay-card';
import { ContentCard } from '@/components/ui/content-card';
import { DiscordCard } from '@/components/home/discord-card';
import { PodcastCard } from '@/components/home/podcast-card';
import Link from 'next/link';

// TODO: Add section to show our Instagram profile.
// TODO: Add section to show our YouTube channel.
// TODO: Add section to show our LinkedIn profile.

const Home = async () => {
  const session = await auth();

  return (
    <div className="mt-4 md:px-20">
      <div className="mb-6 flex flex-col">
        <Heading2>
          {session?.user?.name ? `Hola ${session.user.name.split(' ')[0]}!` : 'Hola!'}
        </Heading2>

        <MotivationalQuotes />
      </div>

      <section className="mb-6 w-full">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <AdvisesCard />
          <ActiveMembersCard />
          <UpcomingEventsCard />
          <LightningTalksCard />
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <UpcomingEventsSection />
          <MainSponsorCard />
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-6 xl:flex-row">
            <BackgroundOverlayCard
              title="¿Sabías que podés sumarte al team de desarrollo de este website?"
              description="Avisanos por Discord!"
            />

            <Link href="/posts/pcn-story">
              <ContentCard
                author="Agustín Sánchez"
                description="Te cuento por qué decidimos crear la comunidad y todos los pasos que hicimos para llegar a donde estamos hoy."
                image="/pre-lightning-talks.jpeg"
                timeToRead="Lectura de 5 minutos"
                title="Historia de programaConNosotros"
              />
            </Link>
          </div>

          <div className="flex flex-col gap-6">
            <DiscordCard />
            <PodcastCard />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
