// A server component: the static sections render to HTML and ship no JavaScript of their own;
// only the interactive leaves inside them (players, carousels, install button) hydrate.
import { AchievementsSection } from '@/components/home/achievements-section';
import { FaqSection } from '@/components/home/faq-section';
import { FeatureBento } from '@/components/home/feature-bento';
import { HomeFooter } from '@/components/home/home-footer';
import { HomeHero } from '@/components/home/home-hero';
import { JoinSection } from '@/components/home/join-section';
import { MusicSection } from '@/components/home/music-section';
import { RecommendedWatchSection } from '@/components/home/recommended-watch-section';
import { Reveal } from '@/components/home/reveal';
import { SocialLinks } from '@/components/home/social-links';
import { PartnersMarquee } from '@/components/home/partners-marquee';
import type { ReactNode } from 'react';

interface HomeSectionsProps {
  userName: string | null;
  title: ReactNode;
  testimonialsSection: ReactNode;
  recentlyAddedEventsSection: ReactNode;
  latestConversationsSection: ReactNode;
  latestTalksSection: ReactNode;
  latestPhotosSection: ReactNode;
  latestChangesSection: ReactNode;
  latestArticlesSection: ReactNode;
  interviewsSection: ReactNode;
  ambassadorsSection: ReactNode;
  storyCardsSection: ReactNode;
}

const HomeSections = ({
  userName,
  title,
  testimonialsSection,
  recentlyAddedEventsSection,
  latestConversationsSection,
  latestTalksSection,
  latestPhotosSection,
  latestChangesSection,
  latestArticlesSection,
  interviewsSection,
  ambassadorsSection,
  storyCardsSection,
}: HomeSectionsProps) => (
  // Break out of the SidebarInset horizontal padding so sections can go full-bleed.
  <div className="-mx-1 md:-mx-6">
    <HomeHero userName={userName} title={title} />
    <PartnersMarquee />

    <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-10 md:gap-16 md:py-14 lg:px-8">
      {recentlyAddedEventsSection && <Reveal>{recentlyAddedEventsSection}</Reveal>}

      <Reveal>
        <FeatureBento />
      </Reveal>

      <Reveal>{latestConversationsSection}</Reveal>

      {latestTalksSection && <Reveal>{latestTalksSection}</Reveal>}

      {latestPhotosSection && <Reveal>{latestPhotosSection}</Reveal>}

      <Reveal>{latestArticlesSection}</Reveal>

      <Reveal>{interviewsSection}</Reveal>

      <Reveal>
        <AchievementsSection />
      </Reveal>

      <Reveal>
        <RecommendedWatchSection />
      </Reveal>

      <Reveal>
        <MusicSection />
      </Reveal>

      <Reveal>{storyCardsSection}</Reveal>

      <Reveal>{testimonialsSection}</Reveal>

      <Reveal>
        <SocialLinks />
      </Reveal>

      <Reveal>{latestChangesSection}</Reveal>

      <Reveal>
        <FaqSection />
      </Reveal>

      <Reveal>{ambassadorsSection}</Reveal>

      <Reveal>
        <JoinSection />
      </Reveal>
    </div>

    <HomeFooter />
  </div>
);

export default HomeSections;
