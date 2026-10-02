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
import { findSession, type SessionUser } from '@/lib/session';

const PlatformLayout = async ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get('sidebar_state')?.value === 'true';
  const sessionId = cookieStore.get('sessionId')?.value;

  let user: SessionUser | null = null;

  if (sessionId) {
    const session = await findSession(sessionId);

    if (session) {
      user = session.user;
    }
  }

  // Obtener próximos eventos para la sidebar
  const upcomingEvents = await fetchUpcomingEvents(5);

  // Obtener contador de notificaciones no leídas (solo para admins)
  const unreadNotificationsCount = user?.role === 'ADMIN' ? await getUnreadNotificationsCount() : 0;

  return (
    <>
      {/* Pantallas grandes: PCN OS, un escritorio con dock y ventanas movibles. */}
      <PcnOs
        user={user ? { id: user.id, name: user.name, email: user.email, image: user.image } : null}
        isAdmin={user?.role === 'ADMIN'}
      />
      <PageVisitTracker />
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
              <SidebarInset className="min-w-0 px-1 pb-[calc(5rem+env(safe-area-inset-bottom))] embedded:pb-0 md:px-6 md:pb-0">
                {children}
              </SidebarInset>
            </ConsoleInterceptor>
          </SidebarProvider>
          <ClassicGlobalSearch />
        </OsGate>
      </div>
    </>
  );
};

export default PlatformLayout;
