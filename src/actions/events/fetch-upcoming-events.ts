'use server';

import { listEventIndex } from '@/lib/event-index';

// Which events are upcoming depends on the time, so it's worked out on each request from the
// cached list.
export const fetchUpcomingEvents = async (limit: number = 5) => {
  const now = new Date();
  const events = await listEventIndex();
  return events
    .filter(({ date, endDate }) => date >= now || (endDate !== null && endDate >= now))
    .slice(0, limit)
    .map(({ id, name, date }) => ({ id, name, date }));
};
