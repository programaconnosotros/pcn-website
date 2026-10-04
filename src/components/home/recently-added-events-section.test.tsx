import { render, screen, within } from '@testing-library/react';
import type { HomeEvent } from '@/actions/events/fetch-home-events';
import { RecentlyAddedEventsSection } from './recently-added-events-section';

jest.mock('@/actions/events/fetch-home-events', () => ({ fetchHomeEvents: jest.fn() }));
const { fetchHomeEvents } = jest.requireMock('@/actions/events/fetch-home-events');

// Noon in Argentina (UTC-3).
const NOW = new Date('2026-05-10T15:00:00Z');

const event = (
  overrides: Omit<Partial<HomeEvent>, '_count'> & {
    id: string;
    date: Date;
    _count?: { registrations: number };
  },
): HomeEvent =>
  ({
    name: `Evento ${overrides.id}`,
    endDate: null,
    flyerImages: [`/${overrides.id}.webp`],
    isOnline: false,
    placeName: null,
    city: null,
    capacity: null,
    markedAsFull: false,
    description: null,
    _count: { registrations: 0 },
    ...overrides,
  }) as HomeEvent;

const renderSection = async () => {
  const node = await RecentlyAddedEventsSection();
  return node ? render(node) : null;
};

describe('RecentlyAddedEventsSection', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(NOW);
  });
  afterEach(() => jest.useRealTimers());

  it('renders nothing when there are no events', async () => {
    fetchHomeEvents.mockResolvedValue({ upcoming: [], past: [] });
    expect(await renderSection()).toBeNull();
  });

  it('headlines the next event and lists the rest with countdowns', async () => {
    fetchHomeEvents.mockResolvedValue({
      upcoming: [
        event({
          id: 'today',
          date: new Date('2026-05-10T22:00:00Z'),
          isOnline: true,
          capacity: 10,
          _count: { registrations: 10 },
          description: 'Charlas relámpago',
        }),
        event({
          id: 'tomorrow',
          date: new Date('2026-05-11T22:00:00Z'),
          placeName: 'Cowork',
          city: 'Tucumán',
        }),
        event({ id: 'later', date: new Date('2026-05-15T22:00:00Z') }),
      ],
      past: [event({ id: 'past', date: new Date('2026-04-01T22:00:00Z'), city: 'Salta' })],
    });
    await renderSection();

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Próximos eventos');

    const featured = screen.getByRole('link', { name: /Evento today/ });
    expect(featured).toHaveAttribute('href', '/eventos/today');
    expect(within(featured).getByText(/próximo · hoy/)).toBeInTheDocument();
    expect(within(featured).getByText('online')).toBeInTheDocument();
    expect(within(featured).getByText(/anotados de 10 lugares/)).toBeInTheDocument();
    expect(within(featured).getByText('Charlas relámpago')).toBeInTheDocument();
    // Full: no point in signing up.
    expect(within(featured).getByText('verEvento();')).toBeInTheDocument();

    const tomorrow = screen.getByRole('link', { name: /Evento tomorrow/ });
    expect(within(tomorrow).getByText('mañana')).toBeInTheDocument();
    expect(within(tomorrow).getByText('Cowork, Tucumán')).toBeInTheDocument();

    expect(
      within(screen.getByRole('link', { name: /Evento later/ })).getByText('en 5 días'),
    ).toBeInTheDocument();

    const past = screen.getByRole('link', { name: /Evento past/ });
    expect(within(past).getByText('ya pasó')).toBeInTheDocument();
    expect(
      within(past).getByRole('img', { name: 'Flyer de Evento past' }).closest('.grayscale'),
    ).not.toBeNull();
  });

  it('invites to sign up for an upcoming event with room left', async () => {
    fetchHomeEvents.mockResolvedValue({
      upcoming: [
        event({ id: 'open', date: new Date('2026-05-12T22:00:00Z'), _count: { registrations: 3 } }),
      ],
      past: [],
    });
    await renderSection();

    const featured = screen.getByRole('link', { name: /Evento open/ });
    expect(within(featured).getByText('anotarme();')).toBeInTheDocument();
    expect(within(featured).getByText(/anotados$/)).toBeInTheDocument();
  });

  it('falls back to the latest past events when nothing is coming up', async () => {
    fetchHomeEvents.mockResolvedValue({
      upcoming: [],
      past: [
        event({
          id: 'last',
          date: new Date('2026-04-20T22:00:00Z'),
          capacity: 20,
          _count: { registrations: 15 },
        }),
      ],
    });
    await renderSection();

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Últimos eventos');
    const featured = screen.getByRole('link', { name: /Evento last/ });
    expect(within(featured).getByText('último evento')).toBeInTheDocument();
    expect(within(featured).getByText('fueron', { exact: false })).not.toHaveTextContent('lugares');
    expect(within(featured).getByText('verEvento();')).toBeInTheDocument();
  });

  it('treats an event marked as full as full', async () => {
    fetchHomeEvents.mockResolvedValue({
      upcoming: [event({ id: 'full', date: new Date('2026-05-12T22:00:00Z'), markedAsFull: true })],
      past: [],
    });
    await renderSection();
    expect(screen.getByText('verEvento();')).toBeInTheDocument();
  });
});
