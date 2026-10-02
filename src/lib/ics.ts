import type { CalendarEvent } from './google-calendar';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';
const DEFAULT_DURATION_MS = 60 * 60 * 1000;

function utcDateTime(date: Date): string {
  return date
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}Z$/, 'Z');
}

// RFC 5545 §3.3.11: backslash, semicolon and comma are escaped, newlines become `\n`.
function escapeText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, ';')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

// RFC 5545 §3.1: lines longer than 75 octets are folded with CRLF + a space.
function foldLine(line: string): string {
  const encoder = new TextEncoder();
  const parts: string[] = [];
  let current = '';

  for (const char of line) {
    const limit = parts.length === 0 ? 75 : 74; // continuation lines start with a space
    if (encoder.encode(current + char).length > limit) {
      parts.push(current);
      current = char;
    } else {
      current += char;
    }
  }
  parts.push(current);

  return parts.join('\r\n ');
}

/** Builds a single-event iCalendar file that Apple Calendar, Outlook and others can import. */
export function createIcsFile(event: CalendarEvent, now: Date = new Date()): string {
  const hasEndTime = event.endDate !== null && event.endDate > event.date;
  const endDate = hasEndTime
    ? event.endDate!
    : new Date(event.date.getTime() + DEFAULT_DURATION_MS);
  const eventUrl = `${SITE_URL}/eventos/${event.id}`;
  const location = event.isOnline
    ? event.streamingUrl
    : [event.placeName, event.address, event.city].filter(Boolean).join(', ');
  const description = [
    event.description,
    event.streamingUrl && `Transmisión: ${event.streamingUrl}`,
    !hasEndTime && 'Hora de finalización no definida.',
    eventUrl,
  ]
    .filter(Boolean)
    .join('\n\n');

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//programaConNosotros//Eventos//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${event.id}@programaconnosotros.com`,
    `DTSTAMP:${utcDateTime(now)}`,
    `DTSTART:${utcDateTime(event.date)}`,
    `DTEND:${utcDateTime(endDate)}`,
    `SUMMARY:${escapeText(event.name)}`,
    `DESCRIPTION:${escapeText(description)}`,
    ...(location ? [`LOCATION:${escapeText(location)}`] : []),
    `URL:${eventUrl}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  return lines.map(foldLine).join('\r\n') + '\r\n';
}
