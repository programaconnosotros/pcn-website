import { Suspense } from 'react';
import { PageTitle } from '@/components/ui/page-title';
import { StickyHeader } from '@/components/ui/sticky-header';
import { EventsList } from '@/components/events/events-list';
import { RuledGridSkeleton } from '@/components/skeletons/page-skeletons';
import { Button } from '@/components/ui/button';
import { Plus, Handshake } from 'lucide-react';
import Link from 'next/link';
import { getCurrentSession } from '@/actions/auth/get-current-session';
import { canCreateEvents } from '@/lib/event-permissions';
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
    url: `${SITE_URL}/eventos`,
    type: 'website',
    siteName: 'programaConNosotros',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Eventos | programaConNosotros',
    description:
      'Meetups, coworks, Lightning Talks y la serie Zero to Agent: descubrí los próximos eventos de la comunidad y participá presencial u online junto a personas apasionadas por el software.',
  },
};

const EventsPage = async () => {
  // Admins y ambassadors pueden crear eventos
  const canCreate = canCreateEvents((await getCurrentSession())?.user);

  return (
    <>
      <div className="flex flex-1 flex-col p-4 pt-0">
        <div className="mt-4">
          <StickyHeader>
            <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
              <PageTitle
                path="eventos"
                meta="meetups, hackathons, coworks, etc."
                className="mb-0 flex-1"
              />
              {!canCreate && (
                <Link
                  href="https://wa.me/5493815777562"
                  target="_blank"
                  className="flex items-center gap-1.5 font-mono text-xs text-pcnGreen-700 hover:text-pcnGreen"
                >
                  <Handshake className="h-3.5 w-3.5" />
                  quiero organizar algo
                </Link>
              )}
              {canCreate && (
                <Link href="/eventos/nuevo">
                  <Button variant="pcn" size="sm" className="flex items-center gap-1.5">
                    <Plus className="h-4 w-4" />
                    crearEvento();
                  </Button>
                </Link>
              )}
            </div>
          </StickyHeader>

          {/* The header shows right away; the list streams in once the events are loaded. */}
          <Suspense fallback={<RuledGridSkeleton count={8} />}>
            <EventsList />
          </Suspense>
        </div>
      </div>
    </>
  );
};

export default EventsPage;
