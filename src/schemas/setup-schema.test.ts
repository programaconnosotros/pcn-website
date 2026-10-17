import { calendarDate, dateInputValue, setupSchema, todayInputValue } from './setup-schema';

const valid = { title: 'Mi escritorio', description: 'Dos monitores y un teclado' };

describe('setupSchema date', () => {
  it('accepts today and past days', () => {
    expect(setupSchema.safeParse({ ...valid, date: todayInputValue() }).success).toBe(true);
    expect(setupSchema.safeParse({ ...valid, date: '2019-03-01' }).success).toBe(true);
  });

  it('rejects malformed and future dates', () => {
    expect(setupSchema.safeParse({ ...valid, date: '01/03/2019' }).success).toBe(false);
    expect(setupSchema.safeParse({ ...valid, date: '2019-13-45' }).success).toBe(false);
    expect(setupSchema.safeParse({ ...valid, date: todayInputValue(5) }).success).toBe(false);
  });
});

describe('calendar date helpers', () => {
  it('keeps the stored day regardless of the time zone', () => {
    const stored = new Date('2026-02-03T00:00:00Z');
    expect(dateInputValue(stored)).toBe('2026-02-03');
    const local = calendarDate(stored);
    expect([local.getFullYear(), local.getMonth(), local.getDate()]).toEqual([2026, 1, 3]);
  });
});
