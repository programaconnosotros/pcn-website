import type { Metadata } from 'next';
import Link from 'next/link';
import { PARTNER_CONTACT_URL } from '@/data/partners';
import { PartnersSection } from '@/components/home/partners-section';
import { PageTitle } from '@/components/ui/page-title';
import { StickyHeader } from '@/components/ui/sticky-header';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

export const metadata: Metadata = {
  title: 'Partners',
  description:
    'Conocé a las empresas y organizaciones que apoyan a programaConNosotros y hacen posible el crecimiento de la comunidad.',
  openGraph: {
    title: 'Partners | programaConNosotros',
    description:
      'Conocé a las empresas y organizaciones que apoyan a programaConNosotros y hacen posible el crecimiento de la comunidad.',
    url: `${SITE_URL}/partners`,
    type: 'website',
    siteName: 'programaConNosotros',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Partners | programaConNosotros',
    description:
      'Conocé a las empresas y organizaciones que apoyan a programaConNosotros y hacen posible el crecimiento de la comunidad.',
  },
};

const Partners = () => {
  return (
    <>
      <div className="-mx-1 px-6 md:-mx-6 md:px-10">
        <div className="mt-4">
          <StickyHeader className="-mx-6 px-6 md:-mx-10 md:px-10">
            <PageTitle
              path="partners"
              meta="organizaciones que apoyan a la comunidad"
              action={
                <Link
                  href={PARTNER_CONTACT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-pcnGreen-700 hover:text-pcnGreen"
                >
                  + sumate como partner →
                </Link>
              }
            />
          </StickyHeader>
          <PartnersSection showHeading={false} />
        </div>
      </div>
    </>
  );
};

export default Partners;
