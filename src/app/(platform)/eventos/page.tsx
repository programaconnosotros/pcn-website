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
import { EventsList } from '@/components/events/events-list';
import { Button } from '@/components/ui/button';
import { Plus, Handshake } from 'lucide-react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

export const metadata: Metadata = {
  title: 'Eventos',
  description:
    'Meetups, coworks, Lightning Talks y la serie Zero to Agent: descubrí los próximos eventos de la comunidad y participá presencial u online junto a personas apasionadas por el software.',
  openGraph: {
    title: 'Eventos | programaConNosotros',
    description:
      'Meetups, coworks, Lightning Talks y la serie Zero to Agent: descubrí los próximos eventos de la comunidad y participá presencial u online junto a personas apasionadas por el software.',
    images: [`${SITE_URL}/pcn-link-preview.png`],
    url: `${SITE_URL}/eventos`,
    type: 'website',
    siteName: 'programaConNosotros',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Eventos | programaConNosotros',
    description:
      'Meetups, coworks, Lightning Talks y la serie Zero to Agent: descubrí los próximos eventos de la comunidad y participá presencial u online junto a personas apasionadas por el software.',
    images: [`${SITE_URL}/pcn-link-preview.png`],
  },
};

const EventsPage = async () => {
  const sessionId = (await cookies()).get('sessionId')?.value;

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
      <div className="flex flex-1 flex-col p-4 pt-0">
        <div className="mt-4">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
            <PageTitle
              path="eventos"
              meta="meetups, coworks, lightning talks y zero to agent"
              className="mb-0 flex-1"
            />
            {!isAdmin && (
              <Link
                href="https://wa.me/5493815777562"
                target="_blank"
                className="flex items-center gap-1.5 font-mono text-xs text-pcnGreen-700 hover:text-pcnGreen"
              >
                <Handshake className="h-3.5 w-3.5" />
                quiero organizar algo
              </Link>
            )}
            {isAdmin && (
              <Link href="/eventos/nuevo">
                <Button variant="pcn" size="sm" className="flex items-center gap-1.5">
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
