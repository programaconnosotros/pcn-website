import { cookies } from 'next/headers';
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import HomeClientSide from '@/app/(platform)/home-client-side';
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
import { WHATSAPP_GROUP_URL } from '@/components/home/home-hero';
import type { Metadata } from 'next';
import { findSession, type SessionWithUser } from '@/lib/session';
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

const Home = async () => {
  const sessionId = (await cookies()).get('sessionId')?.value;

  let session: SessionWithUser | null = null;

  if (sessionId) {
    session = await findSession(sessionId);
  }

  const [featuredTestimonials, storyPhotos] = await Promise.all([
    fetchFeaturedTestimonials(),
    listStoryCardPhotos(),
  ]);

  return (
    <HomeClientSide
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
      featuredTestimonials={featuredTestimonials}
      recentlyAddedEventsSection={<RecentlyAddedEventsSection />}
      latestConversationsSection={<LatestConversationsSection />}
      latestTalksSection={<LatestTalksSection />}
      latestPhotosSection={<LatestPhotosSection />}
      latestChangesSection={<LatestChangesSection />}
      latestArticlesSection={<LatestArticlesSection />}
      interviewsSection={<InterviewsSection />}
      ambassadorsSection={<AmbassadorsSection />}
      storyPhotos={storyPhotos}
    />
  );
};

export default Home;
