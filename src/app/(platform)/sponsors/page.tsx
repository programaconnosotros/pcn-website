import type { Metadata } from 'next';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { SponsorsSection } from '@/components/home/sponsors-section';
import { PageTitle } from '@/components/ui/page-title';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

export const metadata: Metadata = {
  title: 'Sponsors',
  description:
    'Conocé a las empresas y organizaciones que apoyan a programaConNosotros y hacen posible el crecimiento de la comunidad.',
  openGraph: {
    title: 'Sponsors | programaConNosotros',
    description:
      'Conocé a las empresas y organizaciones que apoyan a programaConNosotros y hacen posible el crecimiento de la comunidad.',
    images: [`${SITE_URL}/pcn-link-preview.png`],
    url: `${SITE_URL}/sponsors`,
    type: 'website',
    siteName: 'programaConNosotros',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sponsors | programaConNosotros',
    description:
      'Conocé a las empresas y organizaciones que apoyan a programaConNosotros y hacen posible el crecimiento de la comunidad.',
    images: [`${SITE_URL}/pcn-link-preview.png`],
  },
};

const Sponsors = () => {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/">Inicio</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Sponsors</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="-mx-1 px-6 md:-mx-6 md:px-10">
        <div className="mt-4">
          <PageTitle path="sponsors" meta="empresas que apoyan a la comunidad" />
          <SponsorsSection showHeading={false} />
        </div>
      </div>
    </>
  );
};

export default Sponsors;
