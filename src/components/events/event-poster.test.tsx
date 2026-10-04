import { render, screen } from '@testing-library/react';
import { buildEvent } from '@/test/events';
import { EventPoster } from './event-poster';

jest.mock('@/actions/events/fetch-events', () => ({}));

describe('EventPoster', () => {
  it('shows the flyer on its blurred backdrop and the event details', () => {
    render(<EventPoster event={buildEvent({ flyerImages: ['/f.png'] })} />);

    expect(screen.getByRole('link')).toHaveAttribute('href', '/eventos/e1');
    expect(screen.getByRole('img', { name: 'Flyer de Meetup PCN' })).toHaveAttribute(
      'src',
      '/f.png',
    );
    expect(screen.getByText('Bar XYZ, Córdoba')).toBeInTheDocument();
    expect(screen.getByText('Una juntada para programar')).toBeInTheDocument();
  });

  it('uses the logo without a flyer, and online/full flags', () => {
    render(
      <EventPoster
        event={buildEvent({
          isOnline: true,
          capacity: 1,
          description: '',
          _count: { registrations: 1, talks: 0, galleryItems: 0 },
        })}
      />,
    );

    expect(screen.getByRole('img', { name: 'Flyer de Meetup PCN' })).toHaveAttribute(
      'src',
      '/logo.webp',
    );
    expect(screen.getByText('online')).toBeInTheDocument();
    expect(screen.getByText('Cupo completo')).toBeInTheDocument();
  });

  it('hides the location when there is none', () => {
    render(<EventPoster event={buildEvent({ city: null, placeName: null })} />);

    expect(screen.queryByText('Córdoba')).not.toBeInTheDocument();
  });
});
