import { formatEventOptionDate } from '@/lib/event-option';

// An event inside a selector: its name plus a muted date, so events that share a name (one
// meetup per month) can be told apart. Used by every event dropdown of the site.
export function EventOptionLabel({ name, date }: { name: string; date: Date | string }) {
  return (
    <>
      {name} <span className="text-muted-foreground">· {formatEventOptionDate(date)}</span>
    </>
  );
}
