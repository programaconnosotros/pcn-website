import { auth } from '@/auth';
import { Activities } from '@/components/landing/activities';
import { CommunityHighlights } from '@/components/landing/community-highlights';
import { Discord } from '@/components/landing/discord';
import { PlatformFeatures } from '@/components/landing/platform-features';
import { SparklesHero } from '@/components/landing/sparkles-hero';
import { ThemeToggle } from '@/components/themes/theme-toggle';
import { Github } from 'lucide-react';
import Link from 'next/link';

// TODO: Add testimonials.
// TODO: Add FAQ.
// TODO: Add dynamic data (number of users, advises, activities, etc).
// TODO: Add section to show our Instagram profile.
// TODO: Add section to show our YouTube channel.
// TODO: Add section to show our LinkedIn profile.

export const Home = async () => {
  const session = await auth();

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <main className="flex-1">
        <SparklesHero session={session} />
        <CommunityHighlights />
        <Activities />
        <PlatformFeatures />
        <Discord />

        {/* TODO: Add section to show dynamic data (number of users, advises, activities, etc). */}
      </main>

      <footer className="flex w-full shrink-0 flex-row items-center justify-between gap-2 border-t px-4 py-6 sm:flex-row md:px-6">
        <div className="flex items-center gap-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            <code>programaConNosotros</code>
          </p>

          <div className="flex space-x-4">
            <Link
              href="https://github.com/programaconnosotros/pcn-website"
              className="text-gray-500 hover:text-gray-700"
            >
              <Github className="h-6 w-6" />
              <span className="sr-only">GitHub</span>
            </Link>
          </div>
        </div>

        <div className="flex justify-end">
          <ThemeToggle />
        </div>
      </footer>
    </div>
  );
};

export default Home;
