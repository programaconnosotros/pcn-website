'use client';

import Link from 'next/link';
import { Heading2 } from '../ui/heading-2';
import { Button } from '../ui/button';
import { Building2, Handshake, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SPONSOR_CONTACT_URL, sponsors } from '@/data/sponsors';

interface SponsorsSectionProps {
  /**
   * Whether to render the section's own centered "Sponsors" heading.
   * @default true
   */
  showHeading?: boolean;
}

export const SponsorsSection = ({ showHeading = true }: SponsorsSectionProps) => {
  return (
    <div className={cn('-mx-6 w-[calc(100%+3rem)]', showHeading ? 'py-10' : 'pb-10')}>
      {showHeading && (
        <div className="flex items-center justify-center p-6">
          <Heading2 className="relative z-10 mb-0 flex items-center gap-3 text-center text-3xl text-pcnGreen md:text-4xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-pcnGreen/40 bg-pcnGreen/10">
              <Handshake className="h-5 w-5 text-pcnGreen" />
            </div>
            <span>Sponsors</span>
          </Heading2>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 px-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {sponsors.map((sponsor) => (
          <Link
            key={sponsor.name}
            href={sponsor.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex h-full flex-col items-center rounded-lg border border-white/[0.06] bg-white/[0.02] p-6 text-center transition-all duration-300 hover:-translate-y-0.5 hover:border-pcnGreen/40 hover:bg-white/[0.04]"
          >
            <div className="mb-6 flex h-28 w-full items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={sponsor.logo}
                alt={sponsor.name}
                className={cn(
                  // Same bounding box for every logo so none looks more prominent.
                  'h-14 w-44 object-contain',
                  sponsor.monochromeOnDark && 'brightness-0 invert',
                )}
              />
            </div>
            {sponsor.showName && (
              <h3 className="mb-1 text-xl font-semibold tracking-tight text-foreground">
                {sponsor.name}
              </h3>
            )}
            <p className="text-sm text-muted-foreground">{sponsor.description}</p>
            <p className="mt-2 text-xs text-muted-foreground/70">{sponsor.location}</p>
          </Link>
        ))}

        {/* Card para empresas que quieren sumarse */}
        <Link
          href={SPONSOR_CONTACT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex h-full flex-col items-center justify-center rounded-lg border border-dashed border-pcnGreen/40 bg-[radial-gradient(120%_120%_at_50%_0%,rgba(4,244,190,0.10),transparent_60%)] p-6 text-center transition-colors hover:border-pcnGreen/70"
        >
          <div className="mb-4 flex items-center justify-center gap-3 text-pcnGreen">
            <Building2 className="h-7 w-7" strokeWidth={1.5} />
            <Handshake className="h-7 w-7" strokeWidth={1.5} />
          </div>
          <h3 className="mb-2 text-lg font-semibold tracking-tight text-foreground md:text-xl">
            ¿Querés sumarte como sponsor?
          </h3>
          <p className="mb-5 text-sm text-muted-foreground">
            Sumate y ayudanos a impulsar personas apasionadas por el software.
          </p>
          <Button className="rounded-full">
            <MessageSquare className="mr-2 h-4 w-4" />
            Contactanos
          </Button>
        </Link>
      </div>
    </div>
  );
};
