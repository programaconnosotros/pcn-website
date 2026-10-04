import { screen } from '@testing-library/react';
import { fetchNotifications } from '@/actions/notifications/fetch-notifications';
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
}));
jest.mock('./notifications-client', () => ({
  NotificationsClient: jest.fn(() => <p>bandeja</p>),
}));

describe('/notificaciones', () => {
  it('is an admin listing kept out of search engines', () => {
    expect(metadata).toMatchObject({
      title: 'sudo ls ~/notificaciones',
      robots: { index: false, follow: false },
    });
  });

  it('sends anyone who is not an admin home', async () => {
    mockCookies();
    expect(await thrownBy(() => NotificacionesPage())).toBe('NEXT_REDIRECT:/');

    mockCookies({ sessionId: 'token' });
    jest.mocked(findSession).mockResolvedValueOnce(null);
    expect(await thrownBy(() => NotificacionesPage())).toBe('NEXT_REDIRECT:/');

    jest.mocked(findSession).mockResolvedValueOnce(sessionRow());
    expect(await thrownBy(() => NotificacionesPage())).toBe('NEXT_REDIRECT:/');
    expect(fetchNotifications).not.toHaveBeenCalled();
  });

  it('counts the unread notifications and hands them all to the inbox', async () => {
    const notifications = [
      { id: 'n1', read: false },
      { id: 'n2', read: true },
      { id: 'n3', read: false },
    ];
    mockCookies({ sessionId: 'token' });
    jest.mocked(findSession).mockResolvedValue(adminRow());
    jest.mocked(fetchNotifications).mockResolvedValue(notifications as never);

    await renderPage(NotificacionesPage());

    expect(findSession).toHaveBeenCalledWith('token');
    expect(screen.getByText('3 en total · 2 sin leer')).toBeInTheDocument();
    expect(screen.getByText('bandeja')).toBeInTheDocument();
    expect(jest.mocked(NotificationsClient).mock.calls[0][0]).toEqual({ notifications });
  });

  it('shows only placeholders while loading', () => {
    expectOnlyPlaceholders(<Loading />);
  });
});
