import { Marquee } from '@/components/magicui/marquee';
import { sponsors } from '@/data/sponsors';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Eyebrow } from './section-header';

export const SponsorsMarquee = () => (
  <section className="border-y border-pcnGreen-200 bg-pcnGreen-50 py-8">
    <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 lg:px-8">
      <div className="flex w-full items-center justify-between gap-4">
        <Eyebrow>Nos acompañan</Eyebrow>
        <Link
          href="/sponsors"
          className="text-xs font-medium text-muted-foreground transition-colors hover:text-pcnGreen"
        >
          Ver sponsors →
        </Link>
      </div>

      <div className="w-full [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
        <Marquee pauseOnHover className="p-0 [--duration:45s] [--gap:3.5rem]">
          {sponsors.map((sponsor) => (
            <Link
              key={sponsor.name}
              href={sponsor.url}
              target="_blank"
              rel="noopener noreferrer"
              title={sponsor.name}
              className="flex h-16 shrink-0 items-center justify-center opacity-60 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={sponsor.logo}
                alt={sponsor.name}
                className={cn(
                  // Same bounding box for every logo so none looks more prominent.
                  'h-9 w-32 object-contain',
                  // Dark-on-transparent logos: render as a white mark.
                  sponsor.monochromeOnDark && 'brightness-0 invert',
                )}
              />
            </Link>
          ))}
        </Marquee>
      </div>
    </div>
  </section>
);
