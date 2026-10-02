import { createGoogleCalendarUrl } from './google-calendar';

const event = {
  id: 'cmulnmik90c0g550kn5d0oda2',
  name: 'Café Virtual',
  description: 'Charla sobre tecnología.',
  date: new Date('2026-10-02T20:00:00.000Z'),
  endDate: null,
  isOnline: true,
  streamingUrl: 'https://meet.google.com/jmg-uaxv-vmt',
  placeName: null,
  address: null,
  city: null,
};

describe('createGoogleCalendarUrl', () => {
  it('opens a prefilled Google Calendar draft for an event without an end time', () => {
    const url = new URL(createGoogleCalendarUrl(event));

    expect(url.origin).toBe('https://calendar.google.com');
    expect(url.pathname).toBe('/calendar/r/eventedit');
    expect(url.searchParams.get('action')).toBe('TEMPLATE');
    expect(url.searchParams.get('dates')).toBe('20261002T200000Z/20261002T210000Z');
    expect(url.searchParams.get('stz')).toBe('America/Argentina/Buenos_Aires');
    expect(url.searchParams.get('text')).toBe('Café Virtual');
    expect(url.searchParams.get('location')).toBe(event.streamingUrl);
    expect(url.searchParams.get('details')).toContain('Hora de finalización no definida');
    expect(url.searchParams.get('details')).toContain(`/eventos/${event.id}`);
  });

  it('uses the event end time and physical location when provided', () => {
    const url = new URL(
      createGoogleCalendarUrl({
        ...event,
        endDate: new Date('2026-10-02T22:00:00.000Z'),
        isOnline: false,
        streamingUrl: null,
        placeName: 'Bar Norte',
        address: 'San Martín 123',
        city: 'Tucumán',
      }),
    );

    expect(url.searchParams.get('dates')).toBe('20261002T200000Z/20261002T220000Z');
    expect(url.searchParams.get('location')).toBe('Bar Norte, San Martín 123, Tucumán');
    expect(url.searchParams.get('details')).not.toContain('Hora de finalización no definida');
  });
});
