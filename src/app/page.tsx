import { auth } from '@/auth';
import { Activities } from '@/components/landing/activities';
import { CommunityHighlights } from '@/components/landing/community-highlights';
import { Discord } from '@/components/landing/discord';
import { Hero } from '@/components/landing/hero';
import { Footer } from '@/components/landing/footer';

// TODO: Add testimonials.
// TODO: Add FAQ.
// TODO: Add dynamic data (number of users, advises, activities, etc).
// TODO: Add section to show our Instagram profile.
// TODO: Add section to show our YouTube channel.
// TODO: Add section to show our LinkedIn profile.

export const Home = async () => {
  const session = await auth();

  return (
    <div className="flex min-h-[100dvh] flex-col bg-white dark:bg-black">
      <main className="flex-1">
        <Hero session={session} />
        <CommunityHighlights />
        <Activities />
        <Discord />
      </main>

      <Footer />
    </div>
  );
};

export default Home;
