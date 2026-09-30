import { fetchRecentlyAddedEvents } from '@/actions/events/fetch-recently-added-events';
import { EventRow } from '@/components/events/event-row';
import { RuledGrid } from '@/components/ui/ruled-grid';
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

      <RuledGrid className="grid-cols-1 md:grid-cols-2">
        {events.map((event, index) => (
          <EventRow
            key={event.id}
            event={event}
            className={index === 3 ? 'max-md:hidden' : undefined}
          />
        ))}
      </RuledGrid>
    </section>
  );
};
