'use client';

import type { CSSProperties } from 'react';
import Link from 'next/link';
import { Heading2 } from '../ui/heading-2';
import { RuledGrid, ruledCellClassName } from '../ui/ruled-grid';
import { ArrowUpRight, Handshake } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PARTNER_CONTACT_URL, type Partner, type PartnerKind, partners } from '@/data/partners';

const GROUPS: { kind: PartnerKind; label: string }[] = [
  { kind: 'empresa', label: 'empresas' },
  { kind: 'organizacion', label: 'organizaciones' },
];

interface PartnersSectionProps {
  /**
   * Whether to render the section's own centered "Partners" heading.
   * @default true
   */
  showHeading?: boolean;
}

const PartnerCell = ({ partner }: { partner: Partner }) => (
  <Link
    href={partner.url}
    target="_blank"
    rel="noopener noreferrer"
    className={cn(ruledCellClassName, 'group flex flex-col items-center gap-2 p-4 text-center')}
  >
    <div className="flex h-16 w-full items-center justify-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={partner.logo}
        alt={partner.name}
        className={cn(
          // Same bounding box for every logo so none looks more prominent.
          'h-10 w-36 object-contain',
          partner.monochromeOnDark && 'brightness-0 invert',
        )}
      />
    </div>
    {partner.showName && (
      <h3
        className={cn(
          'font-mono text-sm font-semibold',
          partner.brandColor
            ? 'transition-colors group-hover:text-[var(--partner-brand)]'
            : 'group-hover:text-pcnGreen',
        )}
        style={
          partner.brandColor
            ? ({ '--partner-brand': partner.brandColor } as CSSProperties)
            : undefined
        }
      >
        {partner.name}
      </h3>
    )}
    <p className="text-xs text-muted-foreground">{partner.description}</p>
  </Link>
);

const ContactCell = () => (
  <Link
    href={PARTNER_CONTACT_URL}
    target="_blank"
    rel="noopener noreferrer"
    className={cn(
      ruledCellClassName,
      'group flex flex-col items-center justify-center gap-2 p-4 text-center font-mono',
    )}
  >
    <p className="text-sm font-semibold group-hover:text-pcnGreen">
      <span className="text-pcnGreen-500">+ </span>¿Querés sumarte como partner?
    </p>
    <p className="flex items-center gap-1 text-[11px] text-muted-foreground group-hover:text-pcnGreen">
      contactanos <ArrowUpRight className="h-3 w-3" />
    </p>
  </Link>
);

export const PartnersSection = ({ showHeading = true }: PartnersSectionProps) => {
  return (
    <div className={showHeading ? 'py-6' : 'pb-10'}>
      {showHeading && (
        <Heading2 className="mb-4 flex items-center gap-2 text-2xl text-pcnGreen">
          <Handshake className="h-5 w-5" />
          Partners
        </Heading2>
      )}

      {GROUPS.map(({ kind, label }, index) => (
        <section key={kind} className={cn(index > 0 && 'mt-8')}>
          <h2 className="mb-2 font-mono text-[11px] uppercase tracking-[0.22em] text-pcnGreen">
            <span className="text-pcnGreen-500">{'// '}</span>
            {label}
          </h2>
          <RuledGrid className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {partners
              .filter((partner) => partner.kind === kind)
              .map((partner) => (
                <PartnerCell key={partner.name} partner={partner} />
              ))}
            {index === GROUPS.length - 1 && <ContactCell />}
          </RuledGrid>
        </section>
      ))}
    </div>
  );
};
