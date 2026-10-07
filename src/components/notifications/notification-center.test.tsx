import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { markAllNotificationsAsRead } from '@/actions/notifications/mark-all-as-read';
import { FEED_SEEN_KEY, type NotificationCenterData } from '@/lib/notification-center';
import { NotificationCenter } from './notification-center';

jest.mock('@/actions/notifications/mark-all-as-read', () => ({
  markAllNotificationsAsRead: jest.fn(),
}));

jest.setTimeout(20_000);

const recent = (hoursAgo: number) => new Date(Date.now() - hoursAgo * 3_600_000).toISOString();

const data = (admin: NotificationCenterData['admin'] = null): NotificationCenterData => ({
  feed: [
    { id: 'a', kind: 'evento', title: 'Meetup nuevo', href: '/eventos/a', sortKey: recent(1) },
    {
      id: 'b',
      kind: 'conversacion',
      title: 'Charla vieja',
      href: '/conversaciones?c=b',
      sortKey: recent(24 * 30),
    },
  ],
  admin,
});

const mockFetch = (body: NotificationCenterData) => {
  global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => body }) as never;
};

beforeEach(() => window.localStorage.clear());

describe('NotificationCenter', () => {
  it('badges what is new and lists the feed news in a modal', async () => {
    const body = data();
    mockFetch(body);
    const onNavigate = jest.fn();
    render(<NotificationCenter onNavigate={onNavigate} />);

    const bell = await screen.findByRole('button', { name: 'Notificaciones (1 sin ver)' });
    await userEvent.click(bell);
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('chat')).toBeInTheDocument();

    await userEvent.click(within(dialog).getByText('Meetup nuevo'));
    expect(onNavigate).toHaveBeenCalledWith('/eventos/a');
    // Closing marks the feed as seen: the badge goes away.
    expect(window.localStorage.getItem(FEED_SEEN_KEY)).toBe(body.feed[0].sortKey);
    expect(screen.getByRole('button', { name: 'Notificaciones' })).toBeInTheDocument();
  });

  it('shows admins their inbox and marks it read', async () => {
    window.localStorage.setItem(FEED_SEEN_KEY, new Date().toISOString());
    const admin = {
      unread: 1,
      items: [
        { id: 'n1', title: 'Nueva inscripción', message: 'Ana', read: false, createdAt: recent(2) },
      ],
    };
    mockFetch(data(admin));
    jest.mocked(markAllNotificationsAsRead).mockResolvedValue(undefined);
    render(<NotificationCenter onNavigate={jest.fn()} />);

    await userEvent.click(
      await screen.findByRole('button', { name: 'Notificaciones (1 sin ver)' }),
    );
    // Nothing new in the feed, so it opens on the admin tab.
    expect(await screen.findByRole('tab', { name: /admin/ })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByText('Nueva inscripción')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /marcar todas como leídas/ }));
    await waitFor(() => expect(markAllNotificationsAsRead).toHaveBeenCalled());
  });
});
