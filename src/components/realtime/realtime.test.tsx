import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { mockRouter, setLocation } from '@/test/dom';
import { LiveNews } from './live-news';
import { NewsTicker } from './news-ticker';
import { RealtimeRefresh } from './realtime-refresh';

jest.mock('sonner', () => ({ toast: jest.fn() }));
jest.mock('@/components/notifications/use-notification-center', () => ({
  useNotificationCenter: jest.fn(() => ({
    data: {
      feed: [
        { id: '1', kind: 'evento', title: 'Meetup de octubre', href: '/eventos/e1', sortKey: '' },
        { id: '2', kind: 'rara', title: 'Algo nuevo', meta: 'hoy', href: '/x', sortKey: '' },
      ],
      admin: null,
    },
  })),
}));

class FakeEventSource {
  static instances: FakeEventSource[] = [];
  onmessage: ((_event: { data: string }) => void) | null = null;
  close = jest.fn();
  url: string;
  constructor(url: string) {
    this.url = url;
    FakeEventSource.instances.push(this);
  }
  emit(message: object) {
    act(() => this.onmessage?.({ data: JSON.stringify(message) }));
  }
}

beforeAll(() => {
  (globalThis as unknown as { EventSource: unknown }).EventSource = FakeEventSource;
});
beforeEach(() => {
  FakeEventSource.instances = [];
  setLocation('/');
});
const latest = () => FakeEventSource.instances.at(-1)!;

describe('RealtimeRefresh', () => {
  it('refreshes the page once per burst of messages and closes on unmount', () => {
    jest.useFakeTimers();
    const { unmount } = render(<RealtimeRefresh topics={['event:e1']} />);
    expect(latest().url).toBe('/api/realtime?topics=event%3Ae1');

    latest().emit({ topic: 'event:e1' });
    latest().emit({ topic: 'event:e1' });
    jest.advanceTimersByTime(1_000);
    expect(mockRouter.refresh).toHaveBeenCalledTimes(1);

    unmount();
    expect(latest().close).toHaveBeenCalled();
    jest.useRealTimers();
  });
});

describe('LiveNews', () => {
  it('toasts what is new with a link to it', async () => {
    render(<LiveNews />);
    latest().emit({
      topic: 'feed',
      data: { kind: 'foro', title: 'Un tema', href: '/foro/tema/p1' },
    });
    expect(toast).toHaveBeenCalledWith('Nuevo tema en el foro', {
      description: 'Un tema',
      action: { label: 'ver', onClick: expect.any(Function) },
    });
    const { action } = jest.mocked(toast).mock.calls[0][1] as unknown as {
      action: { onClick: () => void };
    };
    action.onClick();
    expect(mockRouter.push).toHaveBeenCalledWith('/foro/tema/p1');
  });

  it('stays quiet on the feed, inside PCN OS windows and for unsafe links', () => {
    setLocation('/feed');
    const { unmount } = render(<LiveNews />);
    latest().emit({ topic: 'feed', data: { kind: 'foro', title: 'x', href: '/foro' } });
    unmount();

    setLocation('/');
    render(<LiveNews />);
    latest().emit({ topic: 'feed', data: { title: 'x', href: 'https://evil.test' } });
    document.documentElement.setAttribute('data-embedded', '');
    latest().emit({ topic: 'feed', data: { title: 'x', href: '/x' } });
    document.documentElement.removeAttribute('data-embedded');
    expect(toast).not.toHaveBeenCalled();
  });
});

describe('NewsTicker', () => {
  it('crawls the latest headlines with their kind', async () => {
    render(<NewsTicker />);
    expect(screen.getByRole('complementary', { name: 'Últimas novedades' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /PCN en vivo/ })).toHaveAttribute('href', '/feed');
    const meetup = screen.getAllByRole('link', { name: /EVENTO\s*Meetup de octubre/ });
    expect(meetup[0]).toHaveAttribute('href', '/eventos/e1');
    expect(screen.getAllByText('RARA')[0]).toBeInTheDocument();
    await userEvent.hover(meetup[0]);
  });
});
