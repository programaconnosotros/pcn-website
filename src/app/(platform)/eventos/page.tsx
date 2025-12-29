import { Heading2 } from '@/components/ui/heading-2';
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
import { EventsList } from '@/components/events/events-list';
import { Button } from '@/components/ui/button';
import { CalendarDays, Plus } from 'lucide-react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

export const metadata: Metadata = {
  title: 'Eventos (PCN)',
  description:
    'Participá de eventos con personas apasionadas por el software y llevá tu carrera al próximo nivel.',
  openGraph: {
    title: 'Eventos (PCN)',
    description:
      'Participá de eventos con personas apasionadas por el software y llevá tu carrera al próximo nivel.',
    images: [`${SITE_URL}/pcn-link-preview.png`],
    url: `${SITE_URL}/eventos`,
    type: 'website',
    siteName: 'programaConNosotros',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Eventos (PCN)',
    description:
      'Participá de eventos con personas apasionadas por el software y llevá tu carrera al próximo nivel.',
    images: [`${SITE_URL}/pcn-link-preview.png`],
  },
};

const EventsPage = async () => {
  const sessionId = cookies().get('sessionId')?.value;

  let isAdmin = false;

  if (sessionId) {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { user: true },
    });

    if (session?.user.role === 'ADMIN') {
      isAdmin = true;
    }
  }

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
                <BreadcrumbPage>Eventos</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="mt-4">
          <div className="mb-4 flex flex-col gap-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:flex-row sm:items-center sm:justify-between">
            <Heading2 className="m-0 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-pcnPurple/30 bg-pcnPurple/10 dark:border-pcnGreen/50 dark:bg-pcnGreen/10 dark:shadow-[0_0_10px_rgba(4,244,190,0.4)]">
                <CalendarDays className="h-5 w-5 text-pcnPurple dark:text-pcnGreen dark:drop-shadow-[0_0_8px_rgba(4,244,190,0.8)]" />
              </div>
              <span className="dark:drop-shadow-[0_0_12px_rgba(4,244,190,0.8)]">Eventos</span>
            </Heading2>
            {isAdmin && (
              <Link href="/eventos/nuevo" className="w-full sm:w-auto">
                <Button
                  variant="pcn"
                  className="flex w-full items-center justify-center gap-2 sm:w-auto"
                >
                  <Plus className="h-4 w-4" />
                  Crear evento
                </Button>
              </Link>
            )}
          </div>

          <EventsList />
        </div>
      </div>
    </>
  );
};

export default EventsPage;
