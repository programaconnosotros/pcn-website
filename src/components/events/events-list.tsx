'use server';

import React from 'react';
import { fetchEvents } from '@/actions/events/fetch-events';
import { EventCard } from './event-card';

export const EventsList: React.FC = async () => {
  const events = await fetchEvents();

  return (
    <div className="mb-10 flex flex-col md:-mx-2 lg:flex-row">
      {events.length === 0 && (
        <p className="w-full text-center text-sm text-muted-foreground">No hay eventos aún.</p>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {events.map((event, index) => (
          <div key={event.id} className={`mb-4 md:mb-0 ${index >= 0 ? 'mt-4' : ''}`}>
            <EventCard event={event} />
          </div>
        ))}
      </div>
    </div>
  );
};
