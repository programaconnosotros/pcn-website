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

// Plaque-style `14 mar 2025`, always with the year.
export function LocalShortDate({ date }: { date: Date | string }) {
  const d = new Date(date);
  const formatted = new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: tz(),
  })
    .format(d)
    .replace(/[,.]/g, '')
    .replace(/ de /g, ' ');
  return (
    <time dateTime={d.toISOString()} suppressHydrationWarning>
      {formatted}
    </time>
  );
}

// Human-friendly `jue 25 jun · 19:00`; the year is only shown when it isn't the current one.
export function LocalEventDate({ date }: { date: Date | string }) {
  const d = new Date(date);
  const timeZone = tz();
  const sameYear =
    new Intl.DateTimeFormat('es-AR', { year: 'numeric', timeZone }).format(d) ===
    new Intl.DateTimeFormat('es-AR', { year: 'numeric', timeZone }).format(new Date());
  const day = new Intl.DateTimeFormat('es-AR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: sameYear ? undefined : 'numeric',
    timeZone,
  })
    .format(d)
    .replace(/[,.]/g, '');
  const time = new Intl.DateTimeFormat('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone,
  }).format(d);
  return (
    <time dateTime={d.toISOString()} suppressHydrationWarning>
      {day} · {time}
    </time>
  );
}
