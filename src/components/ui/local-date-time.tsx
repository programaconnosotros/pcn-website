'use client';

const CANONICAL_TZ = 'America/Argentina/Buenos_Aires';

function tz(): string | undefined {
  return typeof window === 'undefined' ? CANONICAL_TZ : undefined;
}

export function LocalDate({ date }: { date: Date | string }) {
  const d = new Date(date);
  const formatted = new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: tz(),
  }).format(d);
  return (
    <time dateTime={d.toISOString()} suppressHydrationWarning>
      {formatted}
    </time>
  );
}

export function LocalTime({ date }: { date: Date | string }) {
  const d = new Date(date);
  const formatted = new Intl.DateTimeFormat('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: tz(),
  }).format(d);
  return (
    <time dateTime={d.toISOString()} suppressHydrationWarning>
      {formatted}
    </time>
  );
}

export function LocalDateTime({ date }: { date: Date | string }) {
  const d = new Date(date);
  const formatted = new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: tz(),
  }).format(d);
  return (
    <time dateTime={d.toISOString()} suppressHydrationWarning>
      {formatted}
    </time>
  );
}
