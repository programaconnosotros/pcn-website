import { act, render, screen } from '@testing-library/react';
import { EventStatusBadge } from './event-status-badge';

describe('EventStatusBadge', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2030-05-10T12:00:00'));
  });
  afterEach(() => jest.useRealTimers());

  it('shows open registrations for an upcoming event', () => {
    render(<EventStatusBadge date={new Date('2030-05-11T19:00:00')} endDate={null} />);

    expect(screen.getByText('Inscripciones abiertas')).toBeInTheDocument();
  });

  it('shows full capacity for an upcoming full event', () => {
    render(<EventStatusBadge date={new Date('2030-05-11T19:00:00')} endDate={null} isFull />);

    expect(screen.getByText('Cupo completo')).toBeInTheDocument();
  });

  it('shows "En curso" until the end of the day when there is no end date', () => {
    render(<EventStatusBadge date={new Date('2030-05-10T10:00:00')} endDate={null} isFull />);

    expect(screen.getByText('En curso')).toBeInTheDocument();
  });

  it('renders nothing once the event ended, re-checking every minute', () => {
    const { container } = render(
      <EventStatusBadge
        date={new Date('2030-05-10T10:00:00')}
        endDate={new Date('2030-05-10T12:00:30')}
      />,
    );
    expect(screen.getByText('En curso')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(60_000);
    });

    expect(container).toBeEmptyDOMElement();
  });
});
