import { dateContainsString, formatDate } from './date-formatter';

const date = new Date(2024, 2, 15, 12); // 15 de marzo de 2024

describe('formatDate', () => {
  it('formats the date in Spanish with the full month name', () => {
    expect(formatDate(date)).toBe('15 de marzo de 2024');
  });
});

describe('dateContainsString', () => {
  it('is false for an empty search', () => {
    expect(dateContainsString(date, '')).toBe(false);
  });

  it.each([
    ['15 de marzo', 'the formatted date'],
    ['MARZO', 'the month name, ignoring case'],
    ['mar', 'the short month name'],
    ['2024', 'the year'],
    ['3', 'the month number'],
    ['15', 'the day'],
  ])('matches %s (%s)', (search) => {
    expect(dateContainsString(date, search)).toBe(true);
  });

  it('is false when nothing matches', () => {
    expect(dateContainsString(date, 'julio')).toBe(false);
  });
});
