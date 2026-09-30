'use client';

import Link from 'next/link';
import { Heading2 } from '../ui/heading-2';
import { RuledGrid, ruledCellClassName } from '../ui/ruled-grid';
import { ArrowUpRight, Handshake } from 'lucide-react';
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
    <div className={showHeading ? 'py-6' : 'pb-10'}>
      {showHeading && (
        <Heading2 className="mb-4 flex items-center gap-2 text-2xl text-pcnGreen">
          <Handshake className="h-5 w-5" />
          Sponsors
        </Heading2>
      )}

      <RuledGrid className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {sponsors.map((sponsor) => (
          <Link
            key={sponsor.name}
            href={sponsor.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              ruledCellClassName,
              'group flex flex-col items-center gap-2 p-4 text-center',
            )}
          >
            <div className="flex h-16 w-full items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={sponsor.logo}
                alt={sponsor.name}
                className={cn(
                  // Same bounding box for every logo so none looks more prominent.
                  'h-10 w-36 object-contain',
                  sponsor.monochromeOnDark && 'brightness-0 invert',
                )}
              />
            </div>
            {sponsor.showName && (
              <h3 className="font-mono text-sm font-semibold group-hover:text-pcnGreen">
                {sponsor.name}
              </h3>
            )}
            <p className="text-xs text-muted-foreground">{sponsor.description}</p>
          </Link>
        ))}

        <Link
          href={SPONSOR_CONTACT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            ruledCellClassName,
            'group flex flex-col items-center justify-center gap-2 p-4 text-center font-mono',
          )}
        >
          <p className="text-sm font-semibold group-hover:text-pcnGreen">
            <span className="text-pcnGreen-500">+ </span>¿Querés sumarte como sponsor?
          </p>
          <p className="flex items-center gap-1 text-[11px] text-muted-foreground group-hover:text-pcnGreen">
            contactanos <ArrowUpRight className="h-3 w-3" />
          </p>
        </Link>
      </RuledGrid>
    </div>
  );
};
