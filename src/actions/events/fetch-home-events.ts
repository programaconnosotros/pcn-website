'use server';

import { fetchEvents } from '@/actions/events/fetch-events';

const TIME_ZONE = 'America/Argentina/Buenos_Aires';

/** Midnight of today in Argentina (UTC-3, no DST), when an event without an end date expires. */
const startOfTodayIn = (now: Date) =>
  new Date(
    `${new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE }).format(now)}T00:00:00-03:00`,
  );

/**
 * The events the home's billboard shows: the upcoming ones first (soonest first), then the
 * latest that already happened to fill the remaining slots. An event still running counts as
 * upcoming until its end, or until the end of its day (in Argentina) when it has none. Picked
 * from the cached list of events, since which ones are upcoming depends on the time.
 */
export const fetchHomeEvents = async (slots = 3) => {
  const now = new Date();
  const startOfToday = startOfTodayIn(now);
  const events = await fetchEvents();
  const isUpcoming = ({ date, endDate }: (typeof events)[number]) =>
    date >= now || (endDate ? endDate >= now : date >= startOfToday);
  const upcoming = events
    .filter(isUpcoming)
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, slots);
  // fetchEvents comes newest first.
  const past = events
    .filter((event) => !isUpcoming(event) && event.date < now)
    .slice(0, slots - upcoming.length);
  return { upcoming, past };
};

export type HomeEvent = Awaited<ReturnType<typeof fetchHomeEvents>>['upcoming'][number];
