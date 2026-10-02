'use client';

import { AchievementsSection } from '@/components/home/achievements-section';
import { FaqSection } from '@/components/home/faq-section';
import { FeatureBento } from '@/components/home/feature-bento';
import { HomeFooter } from '@/components/home/home-footer';
import { HomeHero } from '@/components/home/home-hero';
import { InterviewsSection } from '@/components/home/interviews-section';
import { JoinSection } from '@/components/home/join-section';
import { MusicSection } from '@/components/home/music-section';
import { RecommendedWatchSection } from '@/components/home/recommended-watch-section';
import { Reveal } from '@/components/home/reveal';
import { SocialLinks } from '@/components/home/social-links';
import { PartnersMarquee } from '@/components/home/partners-marquee';
import { StoryCards } from '@/components/home/story-cards';
import type { StoryCardPhotos } from '@/lib/gallery';
import {
  TestimonialsSection,
  type FeaturedTestimonial,
} from '@/components/home/testimonials-section';
import React from 'react';

interface HomeClientSideProps {
  userName: string | null;
  title: React.ReactNode;
  featuredTestimonials: FeaturedTestimonial[];
  recentlyAddedEventsSection: React.ReactNode;
  latestConversationsSection: React.ReactNode;
  latestTalksSection: React.ReactNode;
  latestPhotosSection: React.ReactNode;
  latestChangesSection: React.ReactNode;
  latestArticlesSection: React.ReactNode;
  ambassadorsSection: React.ReactNode;
  storyPhotos: StoryCardPhotos;
}

const HomeClientSide = ({
  userName,
  title,
  featuredTestimonials,
  recentlyAddedEventsSection,
  latestConversationsSection,
  latestTalksSection,
  latestPhotosSection,
  latestChangesSection,
  latestArticlesSection,
  ambassadorsSection,
  storyPhotos,
}: HomeClientSideProps) => (
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

      <Reveal>
        <InterviewsSection />
      </Reveal>

      <Reveal>
        <AchievementsSection />
      </Reveal>

      <Reveal>
        <RecommendedWatchSection />
      </Reveal>

      <Reveal>
        <MusicSection />
      </Reveal>

      <Reveal>
        <StoryCards photos={storyPhotos} />
      </Reveal>

      <Reveal>
        <TestimonialsSection testimonials={featuredTestimonials} />
      </Reveal>

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

export default HomeClientSide;
