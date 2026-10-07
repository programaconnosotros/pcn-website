import { render, screen } from '@testing-library/react';
import { fetchAnnouncements } from '@/actions/announcements/get-announcements';
import { fetchUpcomingEvents } from '@/actions/events/fetch-upcoming-events';
import { FeedAside } from './feed-aside';

jest.mock('@/actions/announcements/get-announcements', () => ({ fetchAnnouncements: jest.fn() }));
jest.mock('@/actions/events/fetch-upcoming-events', () => ({ fetchUpcomingEvents: jest.fn() }));

describe('FeedAside', () => {
  it('shows the next event, the latest announcements and the partners', async () => {
    jest
      .mocked(fetchUpcomingEvents)
      .mockResolvedValue([{ id: 'e1', name: 'Meetup', date: new Date('2030-05-10T22:00:00Z') }]);
    jest.mocked(fetchAnnouncements).mockResolvedValue([
      {
        id: 'a1',
        title: 'Nuevo canal',
        content: 'x'.repeat(200),
        category: 'general',
        pinned: true,
      },
    ] as never);
    render(await FeedAside());

    expect(screen.getByRole('link', { name: /Meetup/ })).toHaveAttribute('href', '/eventos/e1');
    expect(screen.getByText('Nuevo canal')).toBeInTheDocument();
    expect(screen.getByText('fijado')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /ver todos los partners/ })).toHaveAttribute(
      'href',
      '/partners',
    );
  });

  it('points to past events when nothing is scheduled', async () => {
    jest.mocked(fetchUpcomingEvents).mockResolvedValue([]);
    jest.mocked(fetchAnnouncements).mockResolvedValue([]);
    render(await FeedAside());
    expect(screen.getByText(/No hay eventos agendados/)).toBeInTheDocument();
  });
});
