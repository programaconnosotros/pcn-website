import { screen } from '@testing-library/react';
import {
  countNotifications,
  fetchNotifications,
} from '@/actions/notifications/fetch-notifications';
import { findSession } from '@/lib/session';
import { mockCookies } from '@/test/cookies';
import {
  adminRow,
  expectOnlyPlaceholders,
  renderPage,
  sessionRow,
  thrownBy,
} from '@/test/pages-m-z';
import Loading from './loading';
import { NotificationsClient } from './notifications-client';
import NotificacionesPage, { metadata } from './page';

jest.mock('next/headers', () => ({ cookies: jest.fn(), headers: jest.fn() }));
jest.mock('@/lib/session', () => ({ findSession: jest.fn() }));
jest.mock('@/actions/notifications/fetch-notifications', () => ({
  fetchNotifications: jest.fn(),
  countNotifications: jest.fn(async () => ({ total: 0, unread: 0 })),
}));
jest.mock('./notifications-client', () => ({
  NotificationsClient: jest.fn(() => <p>bandeja</p>),
}));

describe('/notificaciones', () => {
  it('is a personal inbox kept out of search engines', () => {
    expect(metadata).toMatchObject({
      title: 'ls ~/notificaciones',
      robots: { index: false, follow: false },
    });
  });

  it('sends anyone without a session home', async () => {
    mockCookies();
    expect(await thrownBy(() => NotificacionesPage())).toBe('NEXT_REDIRECT:/');

    mockCookies({ sessionId: 'token' });
    jest.mocked(findSession).mockResolvedValueOnce(null);
    expect(await thrownBy(() => NotificacionesPage())).toBe('NEXT_REDIRECT:/');
    expect(fetchNotifications).not.toHaveBeenCalled();
  });

  it('opens for members too, not only admins', async () => {
    mockCookies({ sessionId: 'token' });
    jest.mocked(findSession).mockResolvedValue(sessionRow());
    jest.mocked(fetchNotifications).mockResolvedValue([]);

    await renderPage(NotificacionesPage());

    expect(screen.getByText('0 en total · 0 sin leer')).toBeInTheDocument();
  });

  it('counts every notification and unread one, and hands the latest to the inbox', async () => {
    const notifications = [
      { id: 'n1', read: false },
      { id: 'n2', read: true },
      { id: 'n3', read: false },
    ];
    mockCookies({ sessionId: 'token' });
    jest.mocked(findSession).mockResolvedValue(adminRow());
    jest.mocked(fetchNotifications).mockResolvedValue(notifications as never);
    // More than the inbox lists: the counts come from the database, not from the list.
    jest.mocked(countNotifications).mockResolvedValueOnce({ total: 340, unread: 2 });

    await renderPage(NotificacionesPage());

    expect(findSession).toHaveBeenCalledWith('token');
    expect(screen.getByText('340 en total · 2 sin leer')).toBeInTheDocument();
    expect(screen.getByText('bandeja')).toBeInTheDocument();
    expect(jest.mocked(NotificationsClient).mock.calls[0][0]).toEqual({ notifications });
  });

  it('shows only placeholders while loading', () => {
    expectOnlyPlaceholders(<Loading />);
  });
});
