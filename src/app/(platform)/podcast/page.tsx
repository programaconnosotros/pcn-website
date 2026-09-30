import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { PageTitle } from '@/components/ui/page-title';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

export const metadata: Metadata = {
  title: 'Podcast',
  description:
    'Conversaciones con referentes de la industria sobre ingeniería de software, arquitectura, IA y carrera profesional. Episodios producidos por la comunidad.',
  openGraph: {
    title: 'Podcast | programaConNosotros',
    description:
      'Conversaciones con referentes de la industria sobre ingeniería de software, arquitectura, IA y carrera profesional. Episodios producidos por la comunidad.',
    images: [`${SITE_URL}/pcn-link-preview.png`],
    url: `${SITE_URL}/podcast`,
    type: 'website',
    siteName: 'programaConNosotros',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Podcast | programaConNosotros',
    description:
      'Conversaciones con referentes de la industria sobre ingeniería de software, arquitectura, IA y carrera profesional. Episodios producidos por la comunidad.',
    images: [`${SITE_URL}/pcn-link-preview.png`],
  },
};

const PodcastPage = async () => {
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
                <BreadcrumbPage>Podcast</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col p-4 pt-0">
        <PageTitle path="podcast" className="mt-4" meta="0 episodios" />

        <p className="border border-pcnGreen-200 p-3 font-mono text-sm text-muted-foreground">
          <span className="text-pcnGreen-500">$ </span>
          próximamente...
        </p>
      </div>
    </>
  );
};

export default PodcastPage;
