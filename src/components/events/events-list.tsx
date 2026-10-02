'use server';

import React from 'react';
import { fetchEvents } from '@/actions/events/fetch-events';
import { RuledGrid } from '@/components/ui/ruled-grid';
import { EventExhibit } from './event-exhibit';
import { EventPoster } from './event-poster';
import { hasEventEnded } from '@/lib/event-status';

type EventWithCount = Awaited<ReturnType<typeof fetchEvents>>[number];

const yearOf = (date: Date) =>
  new Intl.DateTimeFormat('es-AR', {
    year: 'numeric',
    timeZone: 'America/Argentina/Buenos_Aires',
  }).format(new Date(date));

const SectionHeading = ({
  label,
  count,
  note,
}: {
  label: string;
  count: number;
  note?: string;
}) => (
  <div className="mb-3">
    <h2 className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-pcnGreen-500">
      <span className="text-pcnGreen-500/60">#</span>
      {label}
      <span className="text-muted-foreground/60">({count})</span>
      <span className="h-px flex-1 bg-pcnGreen-200" />
    </h2>
    {note && <p className="mt-1.5 font-mono text-xs text-muted-foreground">{note}</p>}
  </div>
);

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
  const upcoming = events.filter((event) => !hasEventEnded(event, now)).reverse();
  const past = events.filter((event) => hasEventEnded(event, now));

  // Every event gets a catalog number in the order it happened, the first one being Nº 001.
  const catalogNumber = new Map(events.map((event, index) => [event.id, events.length - index]));

  const pastByYear = past.reduce<[string, EventWithCount[]][]>((groups, event) => {
    const year = yearOf(event.date);
    const last = groups[groups.length - 1];
    if (last?.[0] === year) last[1].push(event);
    else groups.push([year, [event]]);
    return groups;
  }, []);

  return (
    <div className="mb-14 flex flex-col gap-12">
      <section>
        <SectionHeading label="en cartelera" count={upcoming.length} />
        {upcoming.length > 0 ? (
          <RuledGrid className="grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
            {upcoming.map((event) => (
              <EventPoster key={event.id} event={event} />
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
          <SectionHeading
            label="museo"
            count={past.length}
            note="cada flyer es un momento y energía que creamos juntos. pasá, mirá, acordate."
          />
          <div className="flex flex-col gap-8">
            {pastByYear.map(([year, yearEvents]) => (
              <div key={year}>
                <h3 className="mb-2 flex items-baseline gap-3 font-mono">
                  <span className="text-2xl font-semibold tracking-tight text-pcnGreen sm:text-3xl">
                    {year}
                  </span>
                  <span className="text-xs text-muted-foreground/70">
                    {yearEvents.length} {yearEvents.length === 1 ? 'evento' : 'eventos'}
                  </span>
                </h3>
                <RuledGrid className="grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                  {yearEvents.map((event) => (
                    <EventExhibit
                      key={event.id}
                      event={event}
                      catalogNumber={catalogNumber.get(event.id)!}
                    />
                  ))}
                </RuledGrid>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
