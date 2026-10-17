type DatedEvent = { id: string; date: Date; endDate?: Date | null };

const HOUR_MS = 60 * 60 * 1000;
// Nights run past midnight: photos until early the next morning still belong to the event.
const AFTER_HOURS_MS = 6 * HOUR_MS;

/**
 * The event a photo or video taken at `takenAt` most likely belongs to: one running that day
 * (from the start of its first day to its end, or to the end of its day when it has none, plus
 * the early hours after). When several match, the one that started closest to it wins.
 */
export function findEventForDate<T extends DatedEvent>(events: T[], takenAt: Date): T | null {
  const time = takenAt.getTime();
  if (Number.isNaN(time)) return null;

  const matches = events.filter((event) => {
    const start = new Date(event.date);
    const dayStart = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
    const end = event.endDate
      ? new Date(event.endDate).getTime()
      : new Date(start.getFullYear(), start.getMonth(), start.getDate() + 1).getTime();
    return time >= dayStart && time < end + AFTER_HOURS_MS;
  });

  const distance = (event: T) => Math.abs(time - new Date(event.date).getTime());
  return matches.sort((a, b) => distance(a) - distance(b))[0] ?? null;
}
