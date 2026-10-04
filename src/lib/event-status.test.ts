import { hasEventEnded } from './event-status';

describe('hasEventEnded', () => {
  const date = new Date(2025, 4, 10, 19, 0);

  it('lasts until the end of its day without an explicit end', () => {
    const event = { date, endDate: null };
    expect(hasEventEnded(event, new Date(2025, 4, 10, 23, 59, 59, 999))).toBe(false);
    expect(hasEventEnded(event, new Date(2025, 4, 11, 0, 0))).toBe(true);
  });

  it('ends at the explicit end when there is one', () => {
    const event = { date, endDate: new Date(2025, 4, 10, 21, 0) };
    expect(hasEventEnded(event, new Date(2025, 4, 10, 21, 0))).toBe(false);
    expect(hasEventEnded(event, new Date(2025, 4, 10, 21, 1))).toBe(true);
  });

  it('defaults to the current time', () => {
    expect(hasEventEnded({ date: new Date(2000, 0, 1), endDate: null })).toBe(true);
    expect(hasEventEnded({ date: new Date(2999, 0, 1), endDate: null })).toBe(false);
  });
});
