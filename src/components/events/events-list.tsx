'use server';

import React from 'react';
import { fetchEvents } from '@/actions/events/fetch-events';
import { RuledGrid } from '@/components/ui/ruled-grid';
import { EventRow } from './event-row';

export const EventsList: React.FC = async () => {
  const events = await fetchEvents();

  if (events.length === 0) {
    return (
      <p className="border border-pcnGreen-200 p-4 font-mono text-sm text-muted-foreground">
        <span className="text-pcnGreen-500">$ </span>no hay eventos aún.
      </p>
    );
  }

  return (
    <RuledGrid className="mb-14 grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3">
      {events.map((event) => (
        <EventRow key={event.id} event={event} />
      ))}
    </RuledGrid>
  );
};
