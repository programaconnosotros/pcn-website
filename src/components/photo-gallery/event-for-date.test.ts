import { findEventForDate } from './event-for-date';

// Local times, like the dates read from a photo's EXIF data.
const at = (day: number, hour: number, minute = 0) => new Date(2026, 4, day, hour, minute);

const meetup = { id: 'meetup', date: at(12, 19), endDate: null };
const hackathon = { id: 'hackathon', date: at(20, 9), endDate: at(21, 18) };
const events = [meetup, hackathon];

describe('findEventForDate', () => {
  it('matches photos taken during the event', () => {
    expect(findEventForDate(events, at(12, 20, 30))?.id).toBe('meetup');
    expect(findEventForDate(events, at(21, 12))?.id).toBe('hackathon');
  });

  it('matches photos taken earlier on the day the event starts', () => {
    expect(findEventForDate(events, at(12, 17))?.id).toBe('meetup');
  });

  it('matches photos from the early hours after the event', () => {
    expect(findEventForDate(events, at(13, 2))?.id).toBe('meetup');
    expect(findEventForDate(events, at(21, 23))?.id).toBe('hackathon');
  });

  it('matches nothing on days without events', () => {
    expect(findEventForDate(events, at(11, 20))).toBeNull();
    expect(findEventForDate(events, at(13, 10))).toBeNull();
    expect(findEventForDate(events, new Date(Number.NaN))).toBeNull();
  });

  it('picks the event that started closest to the photo when several match', () => {
    const afterparty = { id: 'afterparty', date: at(12, 23), endDate: null };

    expect(findEventForDate([meetup, afterparty], at(12, 19, 30))?.id).toBe('meetup');
    expect(findEventForDate([meetup, afterparty], at(13, 0, 30))?.id).toBe('afterparty');
  });
});
