'use client';

import { FeatureBento } from '@/components/home/feature-bento';
import { HomeFooter } from '@/components/home/home-footer';
import { HomeHero } from '@/components/home/home-hero';
import { JoinSection } from '@/components/home/join-section';
import { Reveal } from '@/components/home/reveal';
import { SocialLinks } from '@/components/home/social-links';
import { SponsorsMarquee } from '@/components/home/sponsors-marquee';
import { StoryCards } from '@/components/home/story-cards';
import {
  TestimonialsSection,
  type FeaturedTestimonial,
} from '@/components/home/testimonials-section';
import React from 'react';

interface HomeClientSideProps {
  userName: string | null;
  featuredTestimonials: FeaturedTestimonial[];
  recentlyAddedEventsSection: React.ReactNode;
}

const HomeClientSide = ({
  userName,
  featuredTestimonials,
  recentlyAddedEventsSection,
}: HomeClientSideProps) => (
  // Break out of the SidebarInset horizontal padding so sections can go full-bleed.
  <div className="-mx-1 md:-mx-6">
    <HomeHero userName={userName} />
    <SponsorsMarquee />

    <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-10 md:gap-16 md:py-14 lg:px-8">
      {recentlyAddedEventsSection && <Reveal>{recentlyAddedEventsSection}</Reveal>}

      <Reveal>
        <FeatureBento />
      </Reveal>

      <Reveal>
        <StoryCards />
      </Reveal>

      <Reveal>
        <TestimonialsSection testimonials={featuredTestimonials} />
      </Reveal>

      <Reveal>
        <SocialLinks />
      </Reveal>

      <Reveal>
        <JoinSection />
      </Reveal>
    </div>

    <HomeFooter />
  </div>
);

export default HomeClientSide;
