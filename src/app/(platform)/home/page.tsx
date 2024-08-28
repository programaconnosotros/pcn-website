import { AdvisesCard } from '@components/home/advises-card';
import { ActiveMembersCard } from '@components/home/active-members-card';
import { UpcomingEventsCard } from '@components/home/upcoming-events-card';
import { CommunityGrowthCard } from '@components/home/community-growth-card';
import { UpcomingEventsSection } from '@components/home/upcoming-events-section';
import { MainSponsorCard } from '@components/home/main-sponsor-card';
import { LatestArticles } from '@components/home/latest-articles';
import { MotivationalQuotes } from '@components/home/motivational-quotes';
import { Heading2 } from '@/components/ui/heading-2';

const Home = () => (
  <div className="mt-4 md:px-20">
    <div className="mb-6 flex flex-col">
      <Heading2>Hola!</Heading2>
      <MotivationalQuotes />
    </div>

    <section className="w-full">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <AdvisesCard />
        <ActiveMembersCard />
        <UpcomingEventsCard />
        <CommunityGrowthCard />
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <UpcomingEventsSection />
        <MainSponsorCard />
      </div>

      <LatestArticles />
    </section>
  </div>
);

export default Home;
