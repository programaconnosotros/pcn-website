import { ArrowUpRight } from 'lucide-react';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { partnerLogoGroupHoverClassName } from '@/components/home/partner-logo-styles';
import { partners } from '@/data/partners';
import { cn } from '@/lib/utils';

export interface EventSponsor {
  id: string;
  name: string;
  website: string | null;
  logo: string | null;
}

/** Dark logos drawn on a transparent canvas, as the site's partners mark them. */
const invertOnDark = (logo: string) =>
  partners.some((partner) => partner.logo === logo && partner.monochromeOnDark);

const SponsorTile = ({ sponsor }: { sponsor: EventSponsor }) => {
  const content = (
    <>
      <div
        className={cn(
          'flex h-16 w-full items-center justify-center',
          sponsor.website && partnerLogoGroupHoverClassName,
        )}
      >
        {sponsor.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={sponsor.logo}
            alt={sponsor.name}
            className={cn(
              'h-10 w-36 object-contain',
              invertOnDark(sponsor.logo) && 'brightness-0 invert',
            )}
          />
        ) : (
          <span className="break-words text-center font-mono text-base font-semibold tracking-tight">
            {sponsor.name}
          </span>
        )}
      </div>
      <span className="flex items-center gap-1 font-mono text-[11px] text-muted-foreground transition-colors group-hover:text-pcnGreen">
        {sponsor.logo && sponsor.name}
        {sponsor.website && <ArrowUpRight className="size-3" />}
      </span>
    </>
  );
  const className = cn(
    ruledCellClassName,
    'group flex min-w-0 flex-col items-center gap-1 px-3 py-4',
  );

  return sponsor.website ? (
    <a href={sponsor.website} target="_blank" rel="noopener noreferrer" className={className}>
      {content}
    </a>
  ) : (
    <div className={className}>{content}</div>
  );
};

/**
 * The event's sponsors as a wall of logos, with a thank-you line: they're what makes a free
 * event possible, so they get a proper spot instead of a line of links.
 */
export function EventSponsors({
  sponsors,
  compact = false,
}: {
  sponsors: EventSponsor[];
  /** In a narrow column (the memorial's side panel): two per row at every width. */
  compact?: boolean;
}) {
  return (
    <div>
      <p className="mb-3 text-sm text-muted-foreground">
        Gracias a {sponsors.length === 1 ? 'quien hace' : 'quienes hacen'} posible este evento.
      </p>
      <RuledGrid
        className={cn(
          'grid-cols-2',
          !compact && (sponsors.length >= 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'),
          !compact && sponsors.length >= 4 && 'xl:grid-cols-4',
        )}
      >
        {sponsors.map((sponsor) => (
          <SponsorTile key={sponsor.id} sponsor={sponsor} />
        ))}
      </RuledGrid>
    </div>
  );
}
