import type { Metadata } from 'next';
import { SponsorsSection } from '@/components/home/sponsors-section';
import { PageTitle } from '@/components/ui/page-title';
import { StickyHeader } from '@/components/ui/sticky-header';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

export const metadata: Metadata = {
  title: 'Sponsors',
  description:
    'Conocé a las empresas y organizaciones que apoyan a programaConNosotros y hacen posible el crecimiento de la comunidad.',
  openGraph: {
    title: 'Sponsors | programaConNosotros',
    description:
      'Conocé a las empresas y organizaciones que apoyan a programaConNosotros y hacen posible el crecimiento de la comunidad.',
    url: `${SITE_URL}/sponsors`,
    type: 'website',
    siteName: 'programaConNosotros',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sponsors | programaConNosotros',
    description:
      'Conocé a las empresas y organizaciones que apoyan a programaConNosotros y hacen posible el crecimiento de la comunidad.',
  },
};

const Sponsors = () => {
  return (
    <>
      <div className="-mx-1 px-6 md:-mx-6 md:px-10">
        <div className="mt-4">
          <StickyHeader className="-mx-6 px-6 md:-mx-10 md:px-10">
            <PageTitle path="sponsors" meta="organizaciones que apoyan a la comunidad" />
          </StickyHeader>
          <SponsorsSection showHeading={false} />
        </div>
      </div>
    </>
  );
};

export default Sponsors;
