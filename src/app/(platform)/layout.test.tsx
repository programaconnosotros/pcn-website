import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { fetchUpcomingEvents } from '@/actions/events/fetch-upcoming-events';
import { getUnreadNotificationsCount } from '@/actions/notifications/get-unread-count';
import { PcnOs } from '@/components/os/pcn-os';
import { AppSidebar } from '@/components/ui/app-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { findSession } from '@/lib/session';
import { mockCookies } from '@/test/cookies';
import PlatformLayout from './layout';

jest.mock('next/headers', () => ({ cookies: jest.fn() }));
jest.mock('@/lib/session', () => ({ findSession: jest.fn() }));
jest.mock('@/actions/events/fetch-upcoming-events', () => ({ fetchUpcomingEvents: jest.fn() }));
jest.mock('@/actions/notifications/get-unread-count', () => ({
  getUnreadNotificationsCount: jest.fn(),
}));
function mockPassThrough({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}
jest.mock('@/components/ui/sidebar', () => ({
  SidebarProvider: jest.fn(mockPassThrough),
  SidebarInset: mockPassThrough,
}));
jest.mock('@/components/ui/app-sidebar', () => ({ AppSidebar: jest.fn(() => null) }));
jest.mock('@/components/os/pcn-os', () => ({ PcnOs: jest.fn(() => null) }));
jest.mock('@/components/os/os-gate', () => ({ OsGate: mockPassThrough }));
jest.mock('@/components/os/os-bridge', () => ({ OsBridge: () => null }));
jest.mock('@/components/logs/console-interceptor', () => ({ ConsoleInterceptor: mockPassThrough }));
jest.mock('@/components/analytics/page-visit-tracker', () => ({ PageVisitTracker: () => null }));
jest.mock('@/components/search/classic-global-search', () => ({
  ClassicGlobalSearch: () => null,
}));
jest.mock('@/components/pull-to-refresh', () => ({ PullToRefresh: () => null }));

const events = [{ id: 'e1' }];
const user = { id: 'u1', name: 'Ana', email: 'ana@test.com', image: null, role: 'USER' };

const renderLayout = async () =>
  render(await PlatformLayout({ children: <p>contenido de la página</p> }));

describe('PlatformLayout', () => {
  beforeEach(() => {
    jest.mocked(fetchUpcomingEvents).mockResolvedValue(events as never);
    jest.mocked(getUnreadNotificationsCount).mockResolvedValue(7 as never);
  });

  it('renders the page for an anonymous visitor with a closed sidebar and no notifications', async () => {
    mockCookies();
    await renderLayout();

    expect(screen.getByText('contenido de la página')).toBeInTheDocument();
    expect(findSession).not.toHaveBeenCalled();
    expect(fetchUpcomingEvents).toHaveBeenCalledWith(5);
    expect(getUnreadNotificationsCount).not.toHaveBeenCalled();
    expect(jest.mocked(SidebarProvider).mock.calls[0][0]).toMatchObject({ defaultOpen: false });
    expect(jest.mocked(AppSidebar).mock.calls[0][0]).toEqual({
      user: null,
      upcomingEvents: events,
      unreadNotificationsCount: 0,
    });
    expect(jest.mocked(PcnOs).mock.calls[0][0]).toEqual({ user: null, isAdmin: false });
  });

  it('keeps the sidebar open when its cookie says so', async () => {
    mockCookies({ sidebar_state: 'true' });
    await renderLayout();

    expect(jest.mocked(SidebarProvider).mock.calls[0][0]).toMatchObject({ defaultOpen: true });
  });

  it('passes a member to the sidebar and the desktop without counting notifications', async () => {
    mockCookies({ sessionId: 's1' });
    jest.mocked(findSession).mockResolvedValue({ user } as never);
    await renderLayout();

    expect(findSession).toHaveBeenCalledWith('s1');
    expect(getUnreadNotificationsCount).not.toHaveBeenCalled();
    expect(jest.mocked(AppSidebar).mock.calls[0][0]).toMatchObject({
      user,
      unreadNotificationsCount: 0,
    });
    expect(jest.mocked(PcnOs).mock.calls[0][0]).toEqual({
      user: { id: 'u1', name: 'Ana', email: 'ana@test.com', image: null },
      isAdmin: false,
    });
  });

  it('shows admins their unread notification count', async () => {
    mockCookies({ sessionId: 's1' });
    jest.mocked(findSession).mockResolvedValue({ user: { ...user, role: 'ADMIN' } } as never);
    await renderLayout();

    expect(jest.mocked(AppSidebar).mock.calls[0][0]).toMatchObject({
      unreadNotificationsCount: 7,
    });
    expect(jest.mocked(PcnOs).mock.calls[0][0]).toMatchObject({ isAdmin: true });
  });

  it('treats an expired session as anonymous', async () => {
    mockCookies({ sessionId: 'gone' });
    jest.mocked(findSession).mockResolvedValue(null);
    await renderLayout();

    expect(jest.mocked(AppSidebar).mock.calls[0][0]).toMatchObject({ user: null });
  });
});
