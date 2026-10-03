import { Suspense } from 'react';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import HomeSections from '@/app/(platform)/home-sections';
import { PageTitle } from '@/components/ui/page-title';
import { fetchFeaturedTestimonials } from '@/actions/testimonials/fetch-featured-testimonials';
import { RecentlyAddedEventsSection } from '@/components/home/recently-added-events-section';
import { LatestConversationsSection } from '@/components/home/latest-conversations-section';
import { LatestTalksSection } from '@/components/home/latest-talks-section';
import { LatestPhotosSection } from '@/components/home/latest-photos-section';
import { AmbassadorsSection } from '@/components/home/ambassadors-section';
import { LatestChangesSection } from '@/components/home/latest-changes-section';
import { LatestArticlesSection } from '@/components/home/latest-articles';
import { InterviewsSection } from '@/components/home/interviews-section';
import { HomeSectionSkeleton } from '@/components/home/home-section-skeleton';
import { StoryCards } from '@/components/home/story-cards';
import { TestimonialsSection } from '@/components/home/testimonials-section';
import { WHATSAPP_GROUP_URL } from '@/data/whatsapp-group';
import type { Metadata } from 'next';
import { findSession } from '@/lib/session';
import { listStoryCardPhotos } from '@/lib/gallery';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

export const metadata: Metadata = {
  title: 'programaConNosotros',
  description:
    'Sumate a programaConNosotros, la comunidad de apasionados por la ingeniería de software. Eventos, charlas, cursos, podcasts y mucho más para llevar tu carrera al siguiente nivel.',
  openGraph: {
    title: 'programaConNosotros — Comunidad de ingeniería de software',
    description:
      'Sumate a programaConNosotros, la comunidad de apasionados por la ingeniería de software. Eventos, charlas, cursos, podcasts y mucho más para llevar tu carrera al siguiente nivel.',
    url: `${SITE_URL}`,
    type: 'website',
    siteName: 'programaConNosotros',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'programaConNosotros — Comunidad de ingeniería de software',
    description:
      'Sumate a programaConNosotros, la comunidad de apasionados por la ingeniería de software. Eventos, charlas, cursos, podcasts y mucho más para llevar tu carrera al siguiente nivel.',
  },
};

const FeaturedTestimonialsSection = async () => (
  <TestimonialsSection testimonials={await fetchFeaturedTestimonials()} />
);

const StoryCardsSection = async () => <StoryCards photos={await listStoryCardPhotos()} />;

/**
 * Only the session (already read by the layout, so it costs nothing) is awaited here. Every
 * section that needs the database streams in on its own behind a skeleton, so the hero and the
 * static sections show up right away.
 */
const Home = async () => {
  const sessionId = (await cookies()).get('sessionId')?.value;
  const session = sessionId ? await findSession(sessionId) : null;

  return (
    <HomeSections
      userName={session?.user?.name ?? null}
      title={
        <PageTitle
          path={[]}
          className="mb-0"
          action={
            <Link
              href={WHATSAPP_GROUP_URL}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-xs text-pcnGreen-500 transition-colors hover:text-pcnGreen"
            >
              <MessageCircle className="size-3.5" />
              whatsapp ↗
            </Link>
          }
        />
      }
      recentlyAddedEventsSection={
        <Suspense
          fallback={
            <HomeSectionSkeleton
              cells={2}
              gridClassName="grid-cols-1 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]"
              cellClassName="h-72"
            />
          }
        >
          <RecentlyAddedEventsSection />
        </Suspense>
      }
      latestConversationsSection={<LatestConversationsSection />}
      latestTalksSection={
        <Suspense
          fallback={
            <HomeSectionSkeleton gridClassName="grid-cols-1 min-[480px]:grid-cols-2 md:grid-cols-4" />
          }
        >
          <LatestTalksSection />
        </Suspense>
      }
      latestPhotosSection={
        <Suspense fallback={<HomeSectionSkeleton cells={8} />}>
          <LatestPhotosSection />
        </Suspense>
      }
      latestChangesSection={<LatestChangesSection />}
      latestArticlesSection={
        <Suspense
          fallback={
            <HomeSectionSkeleton
              cells={6}
              gridClassName="grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3"
              cellClassName="h-20"
            />
          }
        >
          <LatestArticlesSection />
        </Suspense>
      }
      interviewsSection={<InterviewsSection />}
      ambassadorsSection={
        <Suspense
          fallback={
            <HomeSectionSkeleton
              cells={2}
              gridClassName="lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]"
              cellClassName="h-56"
            />
          }
        >
          <AmbassadorsSection />
        </Suspense>
      }
      testimonialsSection={
        <Suspense
          fallback={
            <HomeSectionSkeleton cells={3} gridClassName="md:grid-cols-3" cellClassName="h-44" />
          }
        >
          <FeaturedTestimonialsSection />
        </Suspense>
      }
      storyCardsSection={
        // The cards themselves are static: they show at once and the photos fade in after.
        <Suspense fallback={<StoryCards photos={{ historia: [], galeria: [] }} />}>
          <StoryCardsSection />
        </Suspense>
      }
    />
  );
};

export default Home;
