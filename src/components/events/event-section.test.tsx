import { render, screen } from '@testing-library/react';
import EventDetails from './event-details';
import { EventOptionLabel } from './event-option-label';
import { EventSection } from './event-section';

describe('EventSection', () => {
  it('renders the heading with its aside and content', () => {
    render(
      <EventSection title="charlas" aside={<span>3</span>}>
        <p>contenido</p>
      </EventSection>,
    );

    expect(screen.getByRole('heading')).toHaveTextContent('// charlas3');
    expect(screen.getByText('contenido')).toBeInTheDocument();
  });

  it('renders without an aside', () => {
    render(<EventSection title="fotos">x</EventSection>);

    expect(screen.getByRole('heading')).toHaveTextContent(/^\/\/ fotos$/);
  });
});

describe('EventDetails', () => {
  it('shows the description', () => {
    render(<EventDetails description="Una juntada" />);

    expect(screen.getByRole('heading', { name: 'Detalles del evento' })).toBeInTheDocument();
    expect(screen.getByText('Una juntada')).toBeInTheDocument();
  });
});

describe('EventOptionLabel', () => {
  it('shows the name with a muted date', () => {
    render(<EventOptionLabel name="Meetup" date="2030-05-10T22:00:00.000Z" />);

    expect(screen.getByText(/Meetup/)).toBeInTheDocument();
    expect(screen.getByText(/^·/)).toHaveClass('text-muted-foreground');
  });
});
