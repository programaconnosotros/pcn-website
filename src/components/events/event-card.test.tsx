import { render, screen } from '@testing-library/react';
import { buildEvent } from '@/test/events';
import { EventCard } from './event-card';

jest.mock('@/actions/events/fetch-events', () => ({}));

describe('EventCard', () => {
  it('links to the event and shows place, description and the placeholder flyer', () => {
    render(<EventCard event={buildEvent()} />);

    expect(screen.getByRole('link', { name: 'Meetup PCN' })).toHaveAttribute('href', '/eventos/e1');
    expect(screen.getByText('Una juntada para programar')).toBeInTheDocument();
    expect(screen.getByText('Bar XYZ, Córdoba, Argentina')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'PCN' })).toBeInTheDocument();
    expect(screen.getByText('Inscripciones abiertas')).toBeInTheDocument();
  });

  it('marks the event full when registrations reach the capacity, and shows online events', () => {
    render(
      <EventCard
        event={buildEvent({
          isOnline: true,
          capacity: 2,
          description: '',
          flyerImages: ['/f.png'],
          _count: { registrations: 2, talks: 0, galleryItems: 0 },
        })}
      />,
    );

    expect(screen.getByText('Online')).toBeInTheDocument();
    expect(screen.getByText('Cupo completo')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Flyer de Meetup PCN' })).toHaveAttribute(
      'src',
      '/f.png',
    );
  });

  it('omits the location when an in-person event has none', () => {
    render(<EventCard event={buildEvent({ city: null, placeName: null })} />);

    expect(screen.queryByText(/Argentina/)).not.toBeInTheDocument();
  });
});
