// How an event is told apart in every event selector of the site: several events share a name
// (one meetup per month), so each option carries its date, e.g. "Meetup de desarrollo · 12 may 2026".

const optionDateFormat = new Intl.DateTimeFormat('es-AR', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'America/Argentina/Buenos_Aires',
});

/** "12 may 2026": the event's day in Argentina, compact enough for a dropdown row. */
export function formatEventOptionDate(date: Date | string): string {
  const parts = optionDateFormat.formatToParts(new Date(date));
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? '';
  return `${part('day')} ${part('month').replace(/\.$/, '')} ${part('year')}`;
}

/** "Meetup de desarrollo · 12 may 2026" — the plain-text label of an event option. */
export function eventOptionLabel(event: { name: string; date: Date | string }): string {
  return `${event.name} · ${formatEventOptionDate(event.date)}`;
}
