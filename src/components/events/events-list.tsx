'use server';

import React from 'react';
import { fetchEvents } from '@/actions/events/fetch-events';
import { RuledGrid } from '@/components/ui/ruled-grid';
import { EventRow } from './event-row';

type EventWithCount = Awaited<ReturnType<typeof fetchEvents>>[number];

// Same rule as EventStatusBadge: without an explicit end, an event lasts until the end of its day.
const hasEnded = (event: EventWithCount, now: Date) => {
  const end = event.endDate ? new Date(event.endDate) : new Date(event.date);
  if (!event.endDate) end.setHours(23, 59, 59, 999);
  return now > end;
};

const SectionHeading = ({ label, count }: { label: string; count: number }) => (
  <h2 className="mb-2 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-pcnGreen-500">
    <span className="text-pcnGreen-500/60">#</span>
    {label}
    <span className="text-muted-foreground/60">({count})</span>
    <span className="h-px flex-1 bg-pcnGreen-200" />
  </h2>
);

const gridClassName = 'grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3';

export const EventsList: React.FC = async () => {
  const events = await fetchEvents();

  if (events.length === 0) {
    return (
      <p className="border border-pcnGreen-200 p-4 font-mono text-sm text-muted-foreground">
        <span className="text-pcnGreen-500">$ </span>no hay eventos aún.
      </p>
    );
  }

  const now = new Date();
  // fetchEvents sorts newest first; upcoming events read best soonest first.
  const upcoming = events.filter((event) => !hasEnded(event, now)).reverse();
  const past = events.filter((event) => hasEnded(event, now));

  return (
    <div className="mb-14 flex flex-col gap-8">
      <section>
        <SectionHeading label="próximos" count={upcoming.length} />
        {upcoming.length > 0 ? (
          <RuledGrid className={gridClassName}>
            {upcoming.map((event) => (
              <EventRow key={event.id} event={event} />
            ))}
          </RuledGrid>
        ) : (
          <p className="border border-dashed border-pcnGreen-200 px-4 py-3 font-mono text-xs text-muted-foreground">
            <span className="text-pcnGreen-500">$ </span>no hay eventos próximos por ahora.
          </p>
        )}
      </section>

      {past.length > 0 && (
        <section>
          <SectionHeading label="pasados" count={past.length} />
          <RuledGrid className={gridClassName}>
            {past.map((event) => (
              <EventRow key={event.id} event={event} past />
            ))}
          </RuledGrid>
        </section>
      )}
    </div>
  );
};
