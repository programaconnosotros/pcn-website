import { render, screen } from '@testing-library/react';
import {
  LocalDate,
  LocalDateTime,
  LocalEventDate,
  LocalShortDate,
  LocalTime,
} from './local-date-time';

// Formatted in the runtime's time zone in the browser; pick a moment that is the same day anywhere
// near UTC and compute expectations with the same Intl so the test is time-zone independent.
const ISO = '2025-03-14T15:30:00.000Z';
const fmt = (options: Intl.DateTimeFormatOptions, date = new Date(ISO)) =>
  new Intl.DateTimeFormat('es-AR', options).format(date);

describe('local date components', () => {
  it('LocalDate renders dd/mm/yyyy with a machine-readable dateTime', () => {
    render(<LocalDate date={ISO} />);
    const time = screen.getByText(fmt({ day: '2-digit', month: '2-digit', year: 'numeric' }));
    expect(time.tagName).toBe('TIME');
    expect(time).toHaveAttribute('dateTime', ISO);
  });

  it('LocalTime renders 24h hours and minutes', () => {
    render(<LocalTime date={new Date(ISO)} />);
    expect(
      screen.getByText(fmt({ hour: '2-digit', minute: '2-digit', hour12: false })),
    ).toBeInTheDocument();
  });

  it('LocalDateTime renders date and time', () => {
    render(<LocalDateTime date={ISO} />);
    expect(screen.getByRole('time')).toHaveTextContent(
      fmt({
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
    );
  });

  it('LocalShortDate renders a plaque-style date without "de" or punctuation', () => {
    render(<LocalShortDate date={ISO} />);
    const text = screen.getByRole('time').textContent ?? '';
    expect(text).toMatch(/^14 mar 2025$/);
  });

  it('LocalEventDate hides the current year and shows other years', () => {
    const thisYear = new Date();
    thisYear.setMonth(5, 25);
    thisYear.setHours(19, 0, 0, 0);
    const { unmount } = render(<LocalEventDate date={thisYear} />);
    const current = screen.getByRole('time').textContent ?? '';
    expect(current).toMatch(/ · 19:00$/);
    expect(current).not.toContain(String(thisYear.getFullYear()));
    unmount();

    render(<LocalEventDate date={ISO} />);
    expect(screen.getByRole('time')).toHaveTextContent('2025');
  });
});
