import { render, screen } from '@testing-library/react';
import { EventAnnouncements } from './event-announcements';

const announcement = (overrides = {}) => ({
  id: 'a1',
  title: 'Cambio de sala',
  content: 'Nos mudamos al aula 2',
  category: 'evento',
  pinned: false,
  published: true,
  authorId: 'u1',
  eventId: 'e1',
  createdAt: new Date(),
  updatedAt: new Date(),
  author: { id: 'u1', name: 'Ada', image: null as string | null },
  ...overrides,
});

describe('EventAnnouncements', () => {
  it('renders nothing without announcements', () => {
    const { container } = render(<EventAnnouncements announcements={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('lists the event announcements with pins and authors', () => {
    render(
      <EventAnnouncements
        announcements={[
          announcement({ pinned: true }),
          announcement({
            id: 'a2',
            title: 'Otro',
            author: { id: 'u2', name: '', image: 'https://cdn.dev/b.png' },
          }),
        ]}
      />,
    );

    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('anuncios del evento[2]');
    expect(screen.getAllByText('Nos mudamos al aula 2')).toHaveLength(2);
    expect(screen.getAllByText('destacado')).toHaveLength(1);
    expect(screen.getByText('A')).toBeInTheDocument();
  });
});
