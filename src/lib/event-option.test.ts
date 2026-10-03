import { eventOptionLabel, formatEventOptionDate } from './event-option';

describe('formatEventOptionDate', () => {
  it('formats the day, short month and year in Spanish', () => {
    expect(formatEventOptionDate(new Date('2026-05-12T22:00:00Z'))).toBe('12 may 2026');
  });

  it("uses Argentina's day, not UTC's", () => {
    // 01:00 UTC on May 13 is still May 12 in Buenos Aires (UTC-3).
    expect(formatEventOptionDate(new Date('2026-05-13T01:00:00Z'))).toBe('12 may 2026');
  });

  it('accepts serialized dates', () => {
    expect(formatEventOptionDate('2025-09-03T21:00:00.000Z')).toBe('3 sept 2025');
  });
});

describe('eventOptionLabel', () => {
  it('puts the date next to the name so same-named events can be told apart', () => {
    const date = new Date('2026-05-12T22:00:00Z');
    expect(eventOptionLabel({ name: 'Meetup de desarrollo', date })).toBe(
      'Meetup de desarrollo · 12 may 2026',
    );
  });
});
