import { cn, formatDate } from './utils';

describe('cn', () => {
  it('joins classes and lets later Tailwind classes win', () => {
    expect(cn('p-2', false && 'hidden', ['text-sm', 'p-4'])).toBe('text-sm p-4');
  });
});

describe('formatDate', () => {
  it('formats a Date in Spanish with the time', () => {
    expect(formatDate(new Date(2024, 0, 5, 9, 7))).toBe('5 de enero de 2024 a las 09:07');
  });

  it('accepts an ISO string', () => {
    const iso = new Date(2024, 11, 31, 23, 30).toISOString();
    expect(formatDate(iso)).toBe('31 de diciembre de 2024 a las 23:30');
  });
});
