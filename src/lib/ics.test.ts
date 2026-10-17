import { createIcsFile } from './ics';

const event = {
  id: 'cmulnmik90c0g550kn5d0oda2',
  name: 'Café Virtual; edición 2, con amigos',
  description: 'Charla sobre tecnología.\nTraé tus preguntas.',
  date: new Date('2026-10-02T20:00:00.000Z'),
  endDate: null,
  isOnline: true,
  streamingUrl: 'https://meet.google.com/jmg-uaxv-vmt',
  placeName: null,
  address: null,
  city: null,
};

const now = new Date('2026-09-30T12:00:00.000Z');

// Unfold continuation lines so assertions don't depend on where folding happened.
const unfold = (ics: string) => ics.replace(/\r\n /g, '');

describe('createIcsFile', () => {
  it('builds a VEVENT with UTC times and a one-hour default duration', () => {
    const ics = createIcsFile(event, now);

    expect(ics.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true);
    expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true);
    expect(ics).toContain('DTSTART:20261002T200000Z');
    expect(ics).toContain('DTEND:20261002T210000Z');
    expect(ics).toContain('DTSTAMP:20260930T120000Z');
    expect(ics).toContain(`UID:${event.id}@programaconnosotros.com`);
    expect(ics).toContain(`LOCATION:${event.streamingUrl}`);
  });

  it('escapes special characters and newlines in text fields', () => {
    const ics = unfold(createIcsFile(event, now));

    expect(ics).toContain('SUMMARY:Café Virtual\\; edición 2\\, con amigos');
    expect(ics).toContain('DESCRIPTION:Charla sobre tecnología.\\nTraé tus preguntas.');
  });

  it('uses the end date and the physical address for in-person events', () => {
    const ics = unfold(
      createIcsFile(
        {
          ...event,
          endDate: new Date('2026-10-02T23:30:00.000Z'),
          isOnline: false,
          streamingUrl: null,
          placeName: 'UTN-FRT',
          address: 'Rivadavia 1050',
          city: 'San Miguel de Tucumán',
        },
        now,
      ),
    );

    expect(ics).toContain('DTEND:20261002T233000Z');
    expect(ics).toContain('LOCATION:UTN-FRT\\, Rivadavia 1050\\, San Miguel de Tucumán');
    expect(ics).not.toContain('Hora de finalización no definida');
  });

  it('folds lines longer than 75 octets', () => {
    const ics = createIcsFile({ ...event, description: 'á'.repeat(200) }, now);

    for (const line of ics.split('\r\n')) {
      expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
    }
  });
});

describe('createIcsFile escaping per RFC 5545', () => {
  // BUG: escapeText replaces ';' with ';' (a no-op), so semicolons in TEXT values go out
  // unescaped; RFC 5545 §3.3.11 requires '\;'. The test above asserts the current output.
  it('escapes semicolons in text fields', () => {
    const ics = unfold(createIcsFile(event, now));
    expect(ics).toContain('SUMMARY:Café Virtual\\; edición 2\\, con amigos');
  });
});
