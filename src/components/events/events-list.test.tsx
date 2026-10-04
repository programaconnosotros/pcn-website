import { render, screen, within } from '@testing-library/react';
import { fetchEvents } from '@/actions/events/fetch-events';
import { buildEvent } from '@/test/events';
import { EventsList } from './events-list';

jest.mock('@/actions/events/fetch-events', () => ({ fetchEvents: jest.fn() }));

const renderList = async () => render((await EventsList({})) as React.ReactElement);

describe('EventsList', () => {
  beforeEach(() => {
    jest.useFakeTimers({ doNotFake: ['setTimeout', 'setInterval', 'clearInterval'] });
    jest.setSystemTime(new Date('2026-06-01T12:00:00.000Z'));
  });
  afterEach(() => jest.useRealTimers());

  it('shows an empty state without events', async () => {
    jest.mocked(fetchEvents).mockResolvedValue([]);

    await renderList();

    expect(screen.getByText(/no hay eventos aún/)).toBeInTheDocument();
  });

  it('splits upcoming (soonest first) from past events grouped by year, with catalog numbers', async () => {
    jest
      .mocked(fetchEvents)
      .mockResolvedValue([
        buildEvent({ id: 'u2', name: 'Futuro lejano', date: new Date('2026-12-01T22:00:00Z') }),
        buildEvent({ id: 'u1', name: 'Futuro cercano', date: new Date('2026-07-01T22:00:00Z') }),
        buildEvent({ id: 'p3', name: 'Pasado 2026', date: new Date('2026-03-01T22:00:00Z') }),
        buildEvent({ id: 'p2', name: 'Pasado 2025 b', date: new Date('2025-10-01T22:00:00Z') }),
        buildEvent({ id: 'p1', name: 'Pasado 2025 a', date: new Date('2025-05-01T22:00:00Z') }),
      ] as never);

    await renderList();

    const [upcoming, museum] = screen.getAllByRole('heading', { level: 2 });
    expect(upcoming).toHaveTextContent('en cartelera(2)');
    expect(museum).toHaveTextContent('museo(3)');
    const posters = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent);
    expect(posters.slice(0, 2)).toEqual(['Futuro cercano', 'Futuro lejano']);
    expect(screen.getByRole('heading', { name: '2026 1 evento' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '2025 2 eventos' })).toBeInTheDocument();
    const oldest = screen.getByRole('link', { name: /Pasado 2025 a/ });
    expect(within(oldest).getByText('Nº 001')).toBeInTheDocument();
  });

  it('says there are no upcoming events and hides the museum when nothing ended', async () => {
    jest
      .mocked(fetchEvents)
      .mockResolvedValue([buildEvent({ date: new Date('2026-03-01T22:00:00Z') })] as never);

    await renderList();

    expect(screen.getByText(/no hay eventos próximos por ahora/)).toBeInTheDocument();
  });

  it('hides the museum when every event is upcoming', async () => {
    jest.mocked(fetchEvents).mockResolvedValue([buildEvent()] as never);

    await renderList();

    expect(screen.queryByText(/museo/)).not.toBeInTheDocument();
  });
});
