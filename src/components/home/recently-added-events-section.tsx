import { fetchRecentlyAddedEvents } from '@/actions/events/fetch-recently-added-events';
import { EventCard } from '@/components/events/event-card';
import { SectionHeader } from './section-header';

export const RecentlyAddedEventsSection = async () => {
  const events = await fetchRecentlyAddedEvents();

  if (events.length === 0) return null;

  return (
    <section>
      <SectionHeader
        eyebrow="Eventos"
        title={
          <>
            Publicados <span className="text-pcnGreen">recientemente</span>
          </>
        }
        description="Presenciales y online, para todo el mundo. Sumate al próximo."
        action={{ label: 'Ver todos los eventos', href: '/eventos' }}
      />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </section>
  );
};
