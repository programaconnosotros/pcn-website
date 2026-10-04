import { render, screen } from '@testing-library/react';
import { buildEvent } from '@/test/events';
import { EventExhibit } from './event-exhibit';

jest.mock('@/actions/events/fetch-events', () => ({}));

describe('EventExhibit', () => {
  it('shows the catalog number, place and what the event left behind', () => {
    render(
      <EventExhibit
        event={buildEvent({ _count: { registrations: 12, talks: 1, galleryItems: 30 } })}
        catalogNumber={7}
      />,
    );

    expect(screen.getByText('Nº 007')).toBeInTheDocument();
    expect(screen.getByText(/· Bar XYZ/)).toBeInTheDocument();
    expect(screen.getByText('12 inscriptos · 1 charla · 30 fotos')).toBeInTheDocument();
  });

  it('uses singular counts, the city as fallback and online', () => {
    const { rerender } = render(
      <EventExhibit
        event={buildEvent({
          placeName: null,
          _count: { registrations: 1, talks: 2, galleryItems: 1 },
        })}
        catalogNumber={120}
      />,
    );
    expect(screen.getByText('Nº 120')).toBeInTheDocument();
    expect(screen.getByText(/· Córdoba/)).toBeInTheDocument();
    expect(screen.getByText('1 inscripto · 2 charlas · 1 foto')).toBeInTheDocument();

    rerender(<EventExhibit event={buildEvent({ isOnline: true })} catalogNumber={1} />);
    expect(screen.getByText(/· online/)).toBeInTheDocument();
    expect(screen.queryByText(/inscript/)).not.toBeInTheDocument();
  });
});
