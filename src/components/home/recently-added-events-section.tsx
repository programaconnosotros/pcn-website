import { fetchRecentlyAddedEvents } from '@/actions/events/fetch-recently-added-events';
import { ArrowRight } from 'lucide-react';
import { EventCard } from '@/components/events/event-card';
import { Heading2 } from '@/components/ui/heading-2';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const RecentlyAddedEventsSection = async () => {
  const events = await fetchRecentlyAddedEvents();

  if (events.length === 0) return null;

  return (
    <div className="mb-6 mt-6">
      <div className="flex items-center justify-center p-6">
        <Heading2 className="relative z-10 mb-6 text-center md:text-left">
          Eventos publicados{' '}
          <span className="text-pcnPurple drop-shadow-[0_0_15px_rgba(80,56,189,0.4)] dark:text-pcnGreen dark:drop-shadow-[0_0_15px_rgba(4,244,190,0.8)]">
            recientemente
          </span>
        </Heading2>
      </div>

      <div className="my-5 ml-0 grid grid-cols-1 gap-5 xl:grid-cols-3">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>

      <div className="mb-6 flex justify-center">
        <Link href="/eventos">
          <Button variant="outline">Ver todos los eventos <ArrowRight className="ml-2 h-4 w-4" /></Button>
        </Link>
      </div>
    </div>
  );
};
