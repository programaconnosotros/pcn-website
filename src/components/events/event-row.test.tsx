import { render, screen } from '@testing-library/react';
import { buildEvent } from '@/test/events';
import { EventRow } from './event-row';

describe('EventRow', () => {
  it('shows the flyer, location and links to the event', () => {
    render(<EventRow event={buildEvent({ flyerImages: ['/f.png'] })} />);

    expect(screen.getByRole('link')).toHaveAttribute('href', '/eventos/e1');
    expect(screen.getByRole('img', { name: 'Meetup PCN' })).toHaveAttribute('src', '/f.png');
    expect(screen.getByText('Bar XYZ, Córdoba')).toBeInTheDocument();
  });

  it('falls back to the logo and shows online events as full when marked', () => {
    render(
      <EventRow event={buildEvent({ isOnline: true, markedAsFull: true, description: '' })} />,
    );

    expect(screen.getByRole('img', { name: 'Meetup PCN' })).toHaveAttribute('src', '/logo.webp');
    expect(screen.getByText('online')).toBeInTheDocument();
    expect(screen.getByText('Cupo completo')).toBeInTheDocument();
  });

  it('hides the location line when there is none', () => {
    render(<EventRow event={buildEvent({ city: null, placeName: null })} />);

    expect(screen.queryByText('Córdoba')).not.toBeInTheDocument();
  });
});
