'use server';

import React from 'react';
import { fetchEvents } from '@/actions/events/fetch-events';
import { EventCard } from './event-card';

export const EventsList: React.FC = async () => {
  const events = await fetchEvents();

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-lg text-muted-foreground">No hay eventos aún.</p>
      </div>
    );
  }

  return (
    <div className="my-5 ml-0 grid grid-cols-1 gap-5 xl:grid-cols-2">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
};
