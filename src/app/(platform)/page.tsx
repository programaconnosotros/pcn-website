import prisma from '@/lib/prisma';
import { Session, User } from '@prisma/client';
import { cookies } from 'next/headers';
import Link from 'next/link';
import HomeClientSide from '@/app/(platform)/home-client-side';
import { Button } from '@/components/ui/button';
import {
  BreadcrumbLink,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { fetchFeaturedTestimonials } from '@/actions/testimonials/fetch-featured-testimonials';
import { RecentlyAddedEventsSection } from '@/components/home/recently-added-events-section';
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
  const sessionId = (await cookies()).get('sessionId')?.value;

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
      <header className="sticky top-0 z-40 -mx-1 flex h-16 shrink-0 items-center justify-between gap-2 bg-background md:-mx-6">
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
        <div className="px-4">
          <Link href="https://chat.whatsapp.com/IFwKhHXoMwM6ysKcbfHiEh" target="_blank">
            <Button variant="default" size="sm" className="text-sm">
              Unirme en WhatsApp
            </Button>
          </Link>
        </div>
      </header>
      <HomeClientSide
        session={session}
        featuredTestimonials={featuredTestimonials}
        recentlyAddedEventsSection={<RecentlyAddedEventsSection />}
      />
    </>
  );
};

export default Home;
