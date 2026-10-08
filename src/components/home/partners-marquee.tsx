import { Marquee } from '@/components/magicui/marquee';
import { partners } from '@/data/partners';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { partnerLogoHoverClassName } from './partner-logo-styles';
import { Eyebrow } from './section-header';

export const PartnersMarquee = () => (
  <section className="border-y border-pcnGreen-200 bg-pcnGreen-50 py-5">
    <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 lg:px-8">
      <div className="flex w-full items-center justify-between gap-4">
        <Eyebrow>Nos acompañan</Eyebrow>
        <Link
          href="/partners"
          className="text-xs font-medium text-muted-foreground transition-colors hover:text-pcnGreen"
        >
          Ver partners →
        </Link>
      </div>

      <div className="w-full mask-[linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
        <Marquee pauseOnHover className="p-0 [--duration:45s] [--gap:3.5rem]">
          {partners.map((partner) => (
            <Link
              key={partner.name}
              href={partner.url}
              target="_blank"
              rel="noopener noreferrer"
              title={partner.name}
              className={cn(
                'flex h-16 shrink-0 items-center justify-center',
                partnerLogoHoverClassName,
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={partner.logo}
                alt={partner.name}
                className={cn(
                  // Same bounding box for every logo so none looks more prominent.
                  'h-9 w-32 object-contain',
                  // Dark-on-transparent logos: render as a white mark.
                  partner.monochromeOnDark && 'brightness-0 invert',
                )}
              />
            </Link>
          ))}
        </Marquee>
      </div>
    </div>
  </section>
);
