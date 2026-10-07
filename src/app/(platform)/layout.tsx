import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/ui/app-sidebar';
import { cookies } from 'next/headers';
import { fetchUpcomingEvents } from '@/actions/events/fetch-upcoming-events';
import { PageVisitTracker } from '@/components/analytics/page-visit-tracker';
import { getUnreadNotificationsCount } from '@/actions/notifications/get-unread-count';
import { ConsoleInterceptor } from '@/components/logs/console-interceptor';
import { OsBridge } from '@/components/os/os-bridge';
import { OsGate } from '@/components/os/os-gate';
import { PcnOs } from '@/components/os/pcn-os';
import { ClassicGlobalSearch } from '@/components/search/classic-global-search';
import { PullToRefresh } from '@/components/pull-to-refresh';
import { LiveNews } from '@/components/realtime/live-news';
import { NewsTicker } from '@/components/realtime/news-ticker';
import { findSession, type SessionUser } from '@/lib/session';

const PlatformLayout = async ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get('sidebar_state')?.value === 'true';
  const sessionId = cookieStore.get('sessionId')?.value;

  // La sesión y los próximos eventos no dependen entre sí: se piden a la vez.
  const [session, upcomingEvents] = await Promise.all([
    sessionId ? findSession(sessionId) : null,
    fetchUpcomingEvents(5),
  ]);
  const user: SessionUser | null = session?.user ?? null;

  // Contador de notificaciones no leídas (solo para admins)
  const unreadNotificationsCount = user?.role === 'ADMIN' ? await getUnreadNotificationsCount() : 0;

  return (
    <>
      {/* Pantallas grandes: PCN OS, un escritorio con dock y ventanas movibles. */}
      <PcnOs
        user={user ? { id: user.id, name: user.name, email: user.email, image: user.image } : null}
        isAdmin={user?.role === 'ADMIN'}
      />
      <PageVisitTracker />
      <LiveNews />
      <OsBridge />
      {/* Resto de pantallas (y páginas dentro de una ventana): sidebar + página. */}
      <div className="os:hidden">
        <OsGate>
          <SidebarProvider defaultOpen={defaultOpen}>
            <AppSidebar
              user={user}
              upcomingEvents={upcomingEvents}
              unreadNotificationsCount={unreadNotificationsCount}
            />
            <ConsoleInterceptor>
              <SidebarInset className="min-w-0 px-1 pb-[calc(5rem+env(safe-area-inset-bottom))] md:px-6 md:pb-0 embedded:pb-0">
                {children}
                <NewsTicker />
              </SidebarInset>
            </ConsoleInterceptor>
          </SidebarProvider>
          <ClassicGlobalSearch />
          <PullToRefresh />
        </OsGate>
      </div>
    </>
  );
};

export default PlatformLayout;
