import prisma from '@/lib/prisma';
import { Session, User } from '@prisma/client';
import { cookies } from 'next/headers';
import HomeClientSide from '@/app/(platform)/home-client-side';
import {
  BreadcrumbLink,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ThemeToggle } from '@/components/themes/theme-toggle';
import { fetchFeaturedTestimonials } from '@/actions/testimonials/fetch-featured-testimonials';
import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

export const metadata: Metadata = {
  title: 'programaConNosotros (PCN)',
  description:
    'La comunidad que necesitas para llevar tu carrera en la industria del software al siguiente nivel.',
  openGraph: {
    title: 'programaConNosotros (PCN)',
    description:
      'La comunidad que necesitas para llevar tu carrera en la industria del software al siguiente nivel',
    images: [`${SITE_URL}/pcn-link-preview.png`],
    url: `${SITE_URL}`,
    type: 'website',
    siteName: 'programaConNosotros',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'programaConNosotros (PCN)',
    description:
      'La comunidad que necesitas para llevar tu carrera en la industria del software al siguiente nivel.',
    images: [`${SITE_URL}/pcn-link-preview.png`],
  },
};

const Home = async () => {
  const sessionId = cookies().get('sessionId')?.value;

  let session: (Session & { user: User }) | null = null;

  if (sessionId) {
    session = await prisma.session.findUnique({
      where: {
        id: sessionId,
      },
      include: {
        user: true,
      },
    });
  }

  const featuredTestimonials = await fetchFeaturedTestimonials();

  return (
    <>
      <header className="flex h-16 shrink-0 items-center justify-between gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/">Inicio</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="flex items-center gap-2 px-4">
          <ThemeToggle />
        </div>
      </header>
      <HomeClientSide session={session} featuredTestimonials={featuredTestimonials} />
    </>
  );
};

export default Home;
