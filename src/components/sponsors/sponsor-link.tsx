'use client';

import type { AnchorHTMLAttributes } from 'react';
import { trackSponsorClick } from '@/actions/sponsors/track-sponsor-click';
import type { SponsorClickSource, SponsorRef } from '@/lib/sponsor-clicks';

/**
 * A link to a sponsor's site, in a new tab, that counts the click for the admins. Middle clicks
 * count too; the count never holds the link back.
 */
export const SponsorLink = ({
  sponsor,
  source,
  href,
  ...props
}: Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'target' | 'rel'> & {
  href: string;
  sponsor: SponsorRef;
  source: SponsorClickSource;
}) => {
  const track = () => {
    trackSponsorClick({ name: sponsor.name, eventId: sponsor.eventId ?? null, source }).catch(
      () => {},
    );
  };

  return (
    <a
      {...props}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={track}
      onAuxClick={(event) => event.button === 1 && track()}
    />
  );
};
