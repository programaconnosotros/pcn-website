import { render, screen } from '@testing-library/react';
import { setLocation } from '@/test/dom';
import { SidebarUpcomingEvents } from './sidebar-upcoming-events';

const event = (id: string, date: string) => ({ id, name: `Evento ${id}`, date: new Date(date) });
const events = [
  event('1', '2025-06-26T22:00:00Z'),
  event('2', '2025-07-03T22:00:00Z'),
  event('3', '2025-07-10T22:00:00Z'),
  event('4', '2025-07-17T22:00:00Z'),
];

afterEach(() => setLocation('/'));

describe('SidebarUpcomingEvents', () => {
  it('renders nothing without events', () => {
    const { container } = render(<SidebarUpcomingEvents events={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('lists up to the limit with date parts and a link to all events', () => {
    setLocation('/eventos/2');
    render(<SidebarUpcomingEvents events={events} />);

    expect(screen.getByText('Próximos eventos')).toBeInTheDocument();
    expect(screen.getByText('Evento 3')).toBeInTheDocument();
    expect(screen.queryByText('Evento 4')).not.toBeInTheDocument();

    const first = screen.getByRole('link', { name: /Evento 1/ });
    expect(first).toHaveAttribute('href', '/eventos/1');
    const date = events[0].date;
    const time = new Intl.DateTimeFormat('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date);
    expect(first).toHaveTextContent(`${time} hs`);
    expect(first).toHaveTextContent(String(date.getDate()));
    expect(first).not.toHaveTextContent('.');

    expect(screen.getByRole('link', { name: /Evento 2/ })).toHaveClass('border-pcnGreen/40');
    expect(first).not.toHaveClass('border-pcnGreen/40');
    expect(screen.getByRole('link', { name: /Ver todos los eventos/ })).toHaveAttribute(
      'href',
      '/eventos',
    );
  });

  it('respects a custom limit', () => {
    render(<SidebarUpcomingEvents events={events} limit={1} />);
    expect(screen.queryByText('Evento 2')).not.toBeInTheDocument();
  });
});
